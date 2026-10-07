const express = require('express');
const mongoose = require('mongoose');

const Consulta = require('../models/consulta');
const Paciente = require('../models/paciente');
const { proteger, somenteAdmin } = require('../middleware/auth');
const { agoraLocal, dataValida, horarioValido } = require('../utils/datas');

const router = express.Router();

const TIPOS = [
    'Avaliação inicial',
    'Sessão de fisioterapia',
    'Retorno',
    'Pilates',
    'Massoterapia'
];

const STATUS = ['Confirmada', 'Pendente', 'Cancelada'];
const STATUS_ATIVOS = ['Confirmada', 'Pendente'];

router.use(proteger);

router.get('/', async (req, res) => {
    try {
        if (req.usuario.papel !== 'admin' && !req.usuario.pacienteId) {
            return res.json([]);
        }

        const filtro =
            req.usuario.papel === 'admin'
                ? {}
                : { pacienteId: req.usuario.pacienteId };

        const consultas = await Consulta
            .find(filtro)
            .sort({ data: 1, horario: 1 });

        res.json(consultas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar consultas.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { tipo, data, horario } = req.body;

        const observacao =
            typeof req.body.observacao === 'string'
                ? req.body.observacao.trim()
                : '';

        const pacienteId =
            req.usuario.papel === 'admin'
                ? req.body.pacienteId
                : req.usuario.pacienteId;

        if (!pacienteId || !tipo || !data || !horario) {
            return res.status(400).json({
                erro: 'Preencha paciente, tipo, data e horário.'
            });
        }

        if (typeof pacienteId !== 'string' || !mongoose.isValidObjectId(pacienteId)) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        if (!TIPOS.includes(tipo)) {
            return res.status(400).json({ erro: 'Tipo de atendimento inválido.' });
        }

        if (!dataValida(data) || !horarioValido(horario)) {
            return res.status(400).json({ erro: 'Data ou horário inválido.' });
        }

        if (observacao.length > 500) {
            return res.status(400).json({
                erro: 'A observação pode ter no máximo 500 caracteres.'
            });
        }

        if (req.usuario.papel !== 'admin') {
            const agora = agoraLocal();

            const noPassado =
                data < agora.data ||
                (data === agora.data && horario <= agora.horario);

            if (noPassado) {
                return res.status(400).json({
                    erro: 'Escolha uma data e um horário futuros.'
                });
            }
        }

        if (!(await Paciente.exists({ _id: pacienteId }))) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const ocupado = await Consulta.exists({
            data,
            horario,
            status: { $in: STATUS_ATIVOS }
        });

        if (ocupado) {
            return res.status(409).json({ erro: 'Este horário já está ocupado.' });
        }

        const consulta = await Consulta.create({
            pacienteId,
            tipo,
            data,
            horario,
            observacao,
            status: 'Pendente'
        });

        res.status(201).json(consulta);
    } catch (erro) {
        if (erro.code === 11000) {
            return res.status(409).json({ erro: 'Este horário já está ocupado.' });
        }

        console.error(erro);
        res.status(500).json({ erro: 'Erro ao agendar consulta.' });
    }
});

router.put('/:id', somenteAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!STATUS.includes(status)) {
            return res.status(400).json({ erro: 'Status inválido.' });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ erro: 'Consulta não encontrada.' });
        }

        const consulta = await Consulta.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!consulta) {
            return res.status(404).json({ erro: 'Consulta não encontrada.' });
        }

        res.json(consulta);
    } catch (erro) {
        if (erro.code === 11000) {
            return res.status(409).json({
                erro: 'Já existe outra consulta ativa neste mesmo horário.'
            });
        }

        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar consulta.' });
    }
});

router.delete('/:id', somenteAdmin, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ erro: 'Consulta não encontrada.' });
        }

        const consulta = await Consulta.findByIdAndDelete(req.params.id);

        if (!consulta) {
            return res.status(404).json({ erro: 'Consulta não encontrada.' });
        }

        res.status(204).send();
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir consulta.' });
    }
});

module.exports = router;