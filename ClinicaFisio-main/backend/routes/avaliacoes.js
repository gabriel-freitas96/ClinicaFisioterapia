const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Avaliacao = require('../models/avaliacao');
const Paciente = require('../models/paciente');
const { proteger, somenteAdmin } = require('../middleware/auth');
const { upload, conferirImagens, pastaUploads } = require('../middleware/upload');
const { apagarFoto } = require('../utils/arquivos');
const { hojeLocal, dataValida } = require('../utils/datas');

const router = express.Router();

const MOBILIDADES = ['Ótima', 'Boa', 'Regular', 'Limitada'];

function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

function numeroNoIntervalo(valor, minimo, maximo) {
    if (valor !== undefined && typeof valor !== 'string') {
        return { ok: false };
    }

    const bruto = texto(valor);

    if (bruto === '') {
        return { ok: true, valor: '' };
    }

    const numero = Number(bruto.replace(',', '.'));

    if (!Number.isFinite(numero) || numero < minimo || numero > maximo) {
        return { ok: false };
    }

    return { ok: true, valor: String(numero) };
}

router.use(proteger);

router.get('/', async (req, res) => {
    try {
        if (req.usuario.papel !== 'admin' && !req.usuario.pacienteId) {
            return res.json([]);
        }

        const filtro = req.usuario.papel === 'admin'
            ? {}
            : { pacienteId: req.usuario.pacienteId };

        const avaliacoes = await Avaliacao
            .find(filtro)
            .sort({ data: -1, createdAt: -1 });

        res.json(avaliacoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
    }
});

router.get('/:id/foto/:tipo', async (req, res) => {
    try {
        const { id, tipo } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ erro: 'ID da avaliação inválido.' });
        }

        if (!['antes', 'depois'].includes(tipo)) {
            return res.status(400).json({ erro: 'Tipo de foto inválido.' });
        }

        const avaliacao = await Avaliacao.findById(id);

        if (!avaliacao) {
            return res.status(404).json({ erro: 'Avaliação não encontrada.' });
        }

        if (req.usuario.papel !== 'admin') {
            if (
                !req.usuario.pacienteId ||
                String(req.usuario.pacienteId) !== String(avaliacao.pacienteId)
            ) {
                return res.status(403).json({
                    erro: 'Você não tem permissão para visualizar esta foto.'
                });
            }
        }

        const foto = tipo === 'antes'
            ? avaliacao.fotoAntes
            : avaliacao.fotoDepois;

        if (!foto) {
            return res.status(404).json({
                erro: 'Esta avaliação não possui esta foto.'
            });
        }

        const caminhoArquivo = path.join(pastaUploads, path.basename(foto));

        if (!fs.existsSync(caminhoArquivo)) {
            return res.status(404).json({ erro: 'Arquivo da foto não encontrado.' });
        }

        return res.sendFile(caminhoArquivo);
    } catch (erro) {
        console.error('Erro ao visualizar foto:', erro);
        return res.status(500).json({ erro: 'Erro ao carregar a foto.' });
    }
});

router.post(
    '/',
    somenteAdmin,
    upload.fields([
        { name: 'fotoAntes', maxCount: 1 },
        { name: 'fotoDepois', maxCount: 1 }
    ]),
    conferirImagens,
    async (req, res) => {
        const antes = req.files?.fotoAntes?.[0];
        const depois = req.files?.fotoDepois?.[0];
        const caminho = arquivo => (arquivo ? `/uploads/${arquivo.filename}` : '');

        function recusar(status, erro) {
            apagarFoto(caminho(antes));
            apagarFoto(caminho(depois));
            return res.status(status).json({ erro });
        }

        try {
            const { pacienteId } = req.body;
            const mobilidade = texto(req.body.mobilidade);
            const observacao = texto(req.body.observacao);

            if (
                typeof pacienteId !== 'string' ||
                !mongoose.isValidObjectId(pacienteId) ||
                !(await Paciente.exists({ _id: pacienteId }))
            ) {
                return recusar(404, 'Paciente não encontrado.');
            }

            if (req.body.data !== undefined && !dataValida(req.body.data)) {
                return recusar(400, 'Data inválida.');
            }

            const peso = numeroNoIntervalo(req.body.peso, 1, 500);
            const altura = numeroNoIntervalo(req.body.altura, 30, 260);
            const dor = numeroNoIntervalo(req.body.dor, 0, 10);

            if (!peso.ok) {
                return recusar(400, 'Peso inválido. Use um valor entre 1 e 500 kg.');
            }

            if (!altura.ok) {
                return recusar(400, 'Altura inválida. Use um valor entre 30 e 260 cm.');
            }

            if (!dor.ok) {
                return recusar(400, 'O nível de dor deve estar entre 0 e 10.');
            }

            if (mobilidade !== '' && !MOBILIDADES.includes(mobilidade)) {
                return recusar(400, 'Mobilidade inválida.');
            }

            if (observacao.length > 2000) {
                return recusar(400, 'A observação pode ter no máximo 2000 caracteres.');
            }

            const avaliacao = await Avaliacao.create({
                pacienteId,
                data: req.body.data || hojeLocal(),
                peso: peso.valor,
                altura: altura.valor,
                dor: dor.valor,
                mobilidade,
                observacao,
                fotoAntes: caminho(antes),
                fotoDepois: caminho(depois)
            });

            res.status(201).json(avaliacao);
        } catch (erro) {
            apagarFoto(caminho(antes));
            apagarFoto(caminho(depois));
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao registrar avaliação.' });
        }
    }
);
router.put(
    '/:id',
    somenteAdmin,
    upload.fields([
        { name: 'fotoAntes', maxCount: 1 },
        { name: 'fotoDepois', maxCount: 1 }
    ]),
    conferirImagens,
    async (req, res) => {

        const antes = req.files?.fotoAntes?.[0];
        const depois = req.files?.fotoDepois?.[0];

        const caminho = arquivo =>
            arquivo
                ? `/uploads/${arquivo.filename}`
                : '';

        try {

            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro: 'ID da avaliação inválido.'
                });
            }

            const avaliacao =
                await Avaliacao.findById(id);

            if (!avaliacao) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(404).json({
                    erro: 'Avaliação não encontrada.'
                });
            }

            const pacienteId =
                texto(req.body.pacienteId);

            const mobilidade =
                texto(req.body.mobilidade);

            const observacao =
                texto(req.body.observacao);

            if (
                !mongoose.isValidObjectId(pacienteId) ||
                !(await Paciente.exists({
                    _id: pacienteId
                }))
            ) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(404).json({
                    erro: 'Paciente não encontrado.'
                });
            }

            if (
                req.body.data !== undefined &&
                !dataValida(req.body.data)
            ) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro: 'Data inválida.'
                });
            }

            const peso =
                numeroNoIntervalo(
                    req.body.peso,
                    1,
                    500
                );

            const altura =
                numeroNoIntervalo(
                    req.body.altura,
                    30,
                    260
                );

            const dor =
                numeroNoIntervalo(
                    req.body.dor,
                    0,
                    10
                );

            if (!peso.ok) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro:
                        'Peso inválido. Use um valor entre 1 e 500 kg.'
                });
            }

            if (!altura.ok) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro:
                        'Altura inválida. Use um valor entre 30 e 260 cm.'
                });
            }

            if (!dor.ok) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro:
                        'O nível de dor deve estar entre 0 e 10.'
                });
            }

            if (
                mobilidade !== '' &&
                !MOBILIDADES.includes(mobilidade)
            ) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro: 'Mobilidade inválida.'
                });
            }

            if (observacao.length > 2000) {

                apagarFoto(caminho(antes));
                apagarFoto(caminho(depois));

                return res.status(400).json({
                    erro:
                        'A observação pode ter no máximo 2000 caracteres.'
                });
            }

            const fotoAntesAntiga =
                avaliacao.fotoAntes;

            const fotoDepoisAntiga =
                avaliacao.fotoDepois;

            avaliacao.pacienteId =
                pacienteId;

            avaliacao.data =
                req.body.data ||
                avaliacao.data;

            avaliacao.peso =
                peso.valor;

            avaliacao.altura =
                altura.valor;

            avaliacao.dor =
                dor.valor;

            avaliacao.mobilidade =
                mobilidade;

            avaliacao.observacao =
                observacao;

            if (antes) {
                avaliacao.fotoAntes =
                    caminho(antes);
            }

            if (depois) {
                avaliacao.fotoDepois =
                    caminho(depois);
            }

            await avaliacao.save();

            if (antes && fotoAntesAntiga) {
                apagarFoto(fotoAntesAntiga);
            }

            if (depois && fotoDepoisAntiga) {
                apagarFoto(fotoDepoisAntiga);
            }

            return res.json(avaliacao);

        } catch (erro) {

            apagarFoto(caminho(antes));
            apagarFoto(caminho(depois));

            console.error(
                'Erro ao editar avaliação:',
                erro
            );

            return res.status(500).json({
                erro: 'Erro ao editar avaliação.'
            });
        }
    }
);


router.delete(
    '/:id',
    somenteAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {

                return res.status(400).json({
                    erro: 'ID da avaliação inválido.'
                });
            }

            const avaliacao =
                await Avaliacao.findById(id);

            if (!avaliacao) {

                return res.status(404).json({
                    erro: 'Avaliação não encontrada.'
                });
            }

            const fotoAntes =
                avaliacao.fotoAntes;

            const fotoDepois =
                avaliacao.fotoDepois;

            await Avaliacao.findByIdAndDelete(id);

            if (fotoAntes) {
                apagarFoto(fotoAntes);
            }

            if (fotoDepois) {
                apagarFoto(fotoDepois);
            }

            return res.status(204).send();

        } catch (erro) {

            console.error(
                'Erro ao excluir avaliação:',
                erro
            );

            return res.status(500).json({
                erro: 'Erro ao excluir avaliação.'
            });
        }
    }
);
router.delete(
    '/:id',
    somenteAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    erro: 'ID da avaliação inválido.'
                });
            }

            const avaliacao =
                await Avaliacao.findById(id);

            if (!avaliacao) {
                return res.status(404).json({
                    erro: 'Avaliação não encontrada.'
                });
            }

            const fotoAntes =
                avaliacao.fotoAntes;

            const fotoDepois =
                avaliacao.fotoDepois;

            await Avaliacao.findByIdAndDelete(id);

            if (fotoAntes) {
                apagarFoto(fotoAntes);
            }

            if (fotoDepois) {
                apagarFoto(fotoDepois);
            }

            return res.status(204).send();

        } catch (erro) {

            console.error(
                'Erro ao excluir avaliação:',
                erro
            );

            return res.status(500).json({
                erro: 'Erro ao excluir avaliação.'
            });
        }
    }
);

module.exports = router;