const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

function segredo() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }
    return process.env.JWT_SECRET;
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario._id.toString() },
        segredo(),
        {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRES_IN || '8h'
        }
    );
}

async function proteger(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ erro: 'Faça login para continuar.' });
    }

    let payload;

    try {
        payload = jwt.verify(token, segredo(), { algorithms: ['HS256'] });
    } catch {
        return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
    }

    try {
        const usuario = await Usuario.findById(payload.id).select('papel pacienteId');

        if (!usuario) {
            return res.status(401).json({ erro: 'Conta não encontrada. Faça login novamente.' });
        }

        req.usuario = {
            id: usuario._id.toString(),
            papel: usuario.papel,
            pacienteId: usuario.pacienteId
        };

        next();
    } catch (erro) {
        next(erro);
    }
}

function somenteAdmin(req, res, next) {
    if (req.usuario?.papel !== 'admin') {
        return res.status(403).json({ erro: 'Apenas o administrador do sistema pode fazer isso.' });
    }
    next();
}

module.exports = { gerarToken, proteger, somenteAdmin };