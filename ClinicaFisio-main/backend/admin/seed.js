require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Usuario = require('../models/usuario');

const EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const SENHA = process.env.ADMIN_PASSWORD || '';

async function seed() {
    if (!process.env.MONGO_URI) {
        throw new Error('Defina MONGO_URI no backend/.env');
    }

    if (!EMAIL || SENHA.length < 10) {
        throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 10 caracteres) no backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    if (await Usuario.exists({ email: EMAIL })) {
        console.log(`A conta ${EMAIL} já existe. Nada a fazer.`);
    } else {
        await Usuario.create({
            nome: 'Joelma Negreiros',
            email: EMAIL,
            senhaHash: await bcrypt.hash(SENHA, 12),
            papel: 'admin'
        });

        console.log(`Administrador criado: ${EMAIL}`);
        console.log('Agora apague ADMIN_PASSWORD do arquivo .env.');
    }

    await mongoose.disconnect();
}

seed().catch(erro => {
    console.error('Erro no seed:', erro.message);
    process.exit(1);
});