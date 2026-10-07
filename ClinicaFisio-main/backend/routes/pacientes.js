const express = require('express');
const mongoose = require('mongoose');

const Paciente = require('../models/paciente');
const Consulta = require('../models/consulta');
const Avaliacao = require('../models/avaliacao');
const Pagamento = require('../models/pagamento');
const Usuario = require('../models/usuario');
const { proteger, somenteAdmin } = require('../middleware/auth');
const { apagarFoto } = require('../utils/arquivos');
const { validarDadosPaciente } = require('../utils/validacao');

const router = express.Router();

router.use(proteger);

router.get('/', async (req, res) => {
    try {
        if (req.usuario.papel === 'admin') {
            return res.json(await Paciente.find().sort({ createdAt: 1 }));
        }

        const paciente = mongoose.isValidObjectId(req.usuario.pacienteId)
            ? await Paciente.findById(req.usuario.pacienteId)
            : null;

        res.json(paciente ? [paciente] : []);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    }
});

router.post('/', somenteAdmin, async (req, res) => {
    try {
        const validacao = validarDadosPaciente(req.body);

        if (validacao.erro) {
            return res.status(400).json({ erro: validacao.erro });
        }

        const paciente = await Paciente.create(validacao.dados);

        res.status(201).json(paciente);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
    }
});

router.put('/:id', somenteAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const validacao = validarDadosPaciente(req.body);

        if (validacao.erro) {
            return res.status(400).json({ erro: validacao.erro });
        }

        const paciente = await Paciente.findByIdAndUpdate(
            id,
            validacao.dados,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!paciente) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        await Usuario.updateMany(
            { pacienteId: id },
            { $set: { nome: paciente.nome } }
        );

        res.json(paciente);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar paciente.' });
    }
});

router.delete('/:id', somenteAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const paciente = await Paciente.findByIdAndDelete(id);

        if (!paciente) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const avaliacoes = await Avaliacao.find({ pacienteId: id });

        avaliacoes.forEach(avaliacao => {
            apagarFoto(avaliacao.fotoAntes);
            apagarFoto(avaliacao.fotoDepois);
        });

        await Promise.all([
            Consulta.deleteMany({ pacienteId: id }),
            Avaliacao.deleteMany({ pacienteId: id }),
            Pagamento.deleteMany({ pacienteId: id }),
            Usuario.deleteMany({ pacienteId: id })
        ]);

        res.status(204).send();
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir paciente.' });
    }
});

module.exports = router;