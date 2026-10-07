const express = require('express');
const mongoose = require('mongoose');

const Pagamento = require('../models/pagamento');
const Paciente = require('../models/paciente');
const { proteger, somenteAdmin } = require('../middleware/auth');
const { hojeLocal, dataValida } = require('../utils/datas');

const router = express.Router();

const METODOS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito'];

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

        res.json(await Pagamento.find(filtro).sort({ createdAt: -1 }));
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar pagamentos.' });
    }
});

router.post('/', somenteAdmin, async (req, res) => {
    try {
        const { pacienteId, metodo } = req.body;

        const descricao =
            typeof req.body.descricao === 'string'
                ? req.body.descricao.trim()
                : '';

        const valor = Math.round(Number(req.body.valor) * 100) / 100;

        if (!pacienteId || !descricao || !(valor > 0)) {
            return res.status(400).json({
                erro: 'Informe paciente, descrição e um valor maior que zero.'
            });
        }

        if (descricao.length > 120) {
            return res.status(400).json({
                erro: 'A descrição pode ter no máximo 120 caracteres.'
            });
        }

        if (valor > 100000) {
            return res.status(400).json({ erro: 'Valor acima do limite permitido.' });
        }

        const metodoFinal = metodo === undefined || metodo === '' ? 'Pix' : metodo;

        if (!METODOS.includes(metodoFinal)) {
            return res.status(400).json({ erro: 'Forma de pagamento inválida.' });
        }

        if (req.body.data !== undefined && !dataValida(req.body.data)) {
            return res.status(400).json({ erro: 'Data inválida.' });
        }

        if (
            typeof pacienteId !== 'string' ||
            !mongoose.isValidObjectId(pacienteId) ||
            !(await Paciente.exists({ _id: pacienteId }))
        ) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const pagamento = await Pagamento.create({
            pacienteId,
            descricao,
            valor,
            metodo: metodoFinal,
            data: req.body.data || hojeLocal(),
            status: 'Pendente'
        });

        res.status(201).json(pagamento);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao registrar pagamento.' });
    }
});

router.put('/:id', somenteAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pago', 'Pendente'].includes(status)) {
            return res.status(400).json({ erro: 'Status inválido.' });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ erro: 'Pagamento não encontrado.' });
        }

        const pagamento = await Pagamento.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );

        if (!pagamento) {
            return res.status(404).json({ erro: 'Pagamento não encontrado.' });
        }

        res.json(pagamento);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar pagamento.' });
    }
});

module.exports = router;