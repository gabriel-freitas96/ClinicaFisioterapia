const express = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const Paciente = require('../models/paciente');
const { gerarToken, proteger } = require('../middleware/auth');
const { limpar, validarDadosPaciente, senhaForte } = require('../utils/validacao');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-igualar-tempo', 10);

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
            return res.status(400).json({ erro: 'Informe e-mail e senha.' });
        }

        if (senha.length > 128 || email.length > 254) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const usuario = await Usuario.findOne({
            email: email.trim().toLowerCase()
        });

        const senhaConfere = await bcrypt.compare(
            senha,
            usuario ? usuario.senhaHash : HASH_FALSO
        );

        if (!usuario || !senhaConfere) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        res.json({
            token: gerarToken(usuario),
            papel: usuario.papel,
            pacienteId: usuario.pacienteId,
            nome: usuario.nome
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao entrar no sistema.' });
    }
});

router.post('/registrar', async (req, res) => {
    try {
        const email = limpar(req.body.email).toLowerCase();
        const { senha } = req.body;

        const validacao = validarDadosPaciente(req.body);

        if (validacao.erro) {
            return res.status(400).json({ erro: validacao.erro });
        }

        if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ erro: 'Informe um e-mail válido.' });
        }

        if (!senhaForte(senha)) {
            return res.status(400).json({
                erro: 'A senha precisa ter de 8 a 72 caracteres, com pelo menos uma letra e um número.'
            });
        }

        if (await Usuario.exists({ email })) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        const paciente = await Paciente.create(validacao.dados);

        try {
            await Usuario.create({
                nome: paciente.nome,
                email,
                senhaHash: await bcrypt.hash(senha, 10),
                papel: 'user',
                pacienteId: paciente._id.toString()
            });
        } catch (erro) {
            await Paciente.findByIdAndDelete(paciente._id);
            throw erro;
        }

        res.status(201).json({ mensagem: 'Conta criada.' });
    } catch (erro) {
        if (erro.code === 11000) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar conta.' });
    }
});

router.get('/me', proteger, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(401).json({ erro: 'Conta não encontrada. Faça login novamente.' });
        }

        res.json({ papel: usuario.papel, pacienteId: usuario.pacienteId, nome: usuario.nome });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar sessão.' });
    }
});

module.exports = router;