require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 5000;

const origensPermitidas = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origem => origem.trim())
    .filter(Boolean);

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
    origin(origem, callback) {
        if (!origem || origensPermitidas.includes(origem)) {
            return callback(null, true);
        }

        callback(new Error('Origem não permitida pelo CORS.'));
    }
}));

app.use(express.json({ limit: '1mb' }));

const limitadorGeral = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' }
});

const limitadorAutenticacao = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' }
});

app.use('/api', limitadorGeral);
app.use('/api/auth/login', limitadorAutenticacao);
app.use('/api/auth/registrar', limitadorAutenticacao);

app.get('/api/teste', (req, res) => {
    res.json({ mensagem: 'API funcionando perfeitamente!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pacientes', require('./routes/pacientes'));
app.use('/api/consultas', require('./routes/consultas'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));
app.use('/api/pagamentos', require('./routes/pagamentos'));

app.use('/api', (req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
    if (erro.message === 'Origem não permitida pelo CORS.') {
        return res.status(403).json({ erro: erro.message });
    }

    if (erro.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ erro: 'Cada foto pode ter no máximo 8 MB.' });
    }

    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'JSON inválido.' });
    }

    if (erro.type === 'entity.too.large') {
        return res.status(413).json({ erro: 'Os dados enviados são grandes demais.' });
    }

    if (
        erro.name === 'MulterError' ||
        erro.message?.startsWith('Envie apenas imagens')
    ) {
        return res.status(400).json({ erro: erro.message });
    }

    if (erro.name === 'ValidationError') {
        const primeira = Object.values(erro.errors || {})[0];
        return res.status(400).json({ erro: primeira?.message || 'Dados inválidos.' });
    }

    if (erro.name === 'CastError') {
        return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    if (erro.code === 11000) {
        return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
    }

    console.error(erro);

    res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function iniciar() {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        console.error('Defina MONGO_URI e JWT_SECRET no backend/.env');
        process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.error('JWT_SECRET muito curto. Use pelo menos 32 caracteres (veja o .env.example).');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB conectado.');

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (erro) {
        console.error('Não foi possível conectar ao MongoDB:', erro.message);
        process.exit(1);
    }
}

if (require.main === module) {
    iniciar();
}

module.exports = app;