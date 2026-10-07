require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Usuario = require('../models/usuario');

async function trocarSenha() {
    const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const senha = process.env.ADMIN_PASSWORD || '';

    if (!process.env.MONGO_URI || !email || senha.length < 10) {
        throw new Error('Defina MONGO_URI, ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 10 caracteres) no backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const usuario = await Usuario.findOne({ email, papel: 'admin' });

    if (!usuario) {
        throw new Error(`Nenhum administrador encontrado com o e-mail ${email}.`);
    }

    usuario.senhaHash = await bcrypt.hash(senha, 12);
    await usuario.save();

    console.log(`Senha do administrador ${email} atualizada.`);
    console.log('Agora apague ADMIN_PASSWORD do arquivo .env.');
}

trocarSenha()
    .catch(erro => {
        console.error('Erro ao trocar a senha:', erro.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());