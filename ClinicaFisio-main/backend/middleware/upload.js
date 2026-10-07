const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pastaUploads = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(pastaUploads, { recursive: true });

const EXTENSOES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, pastaUploads);
    },

    filename: (_req, file, cb) => {
        const ext = EXTENSOES[file.mimetype];
        const nome = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, nome);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 8 * 1024 * 1024,
        files: 2
    },

    fileFilter: (_req, file, cb) => {
        if (!EXTENSOES[file.mimetype]) {
            return cb(new Error('Envie apenas imagens JPG, PNG ou WEBP.'));
        }

        cb(null, true);
    }
});

function assinaturaCorresponde(caminho, mimetype) {
    const descritor = fs.openSync(caminho, 'r');
    const inicio = Buffer.alloc(12);

    try {
        fs.readSync(descritor, inicio, 0, 12, 0);
    } finally {
        fs.closeSync(descritor);
    }

    if (mimetype === 'image/jpeg') {
        return inicio[0] === 0xff && inicio[1] === 0xd8 && inicio[2] === 0xff;
    }

    if (mimetype === 'image/png') {
        return inicio.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        );
    }

    if (mimetype === 'image/webp') {
        return (
            inicio.subarray(0, 4).toString('latin1') === 'RIFF' &&
            inicio.subarray(8, 12).toString('latin1') === 'WEBP'
        );
    }

    return false;
}

function conferirImagens(req, res, next) {
    const arquivos = Object.values(req.files || {}).flat();

    let valido = true;

    try {
        valido = arquivos.every(arquivo =>
            assinaturaCorresponde(arquivo.path, arquivo.mimetype)
        );
    } catch {
        valido = false;
    }

    if (!valido) {
        arquivos.forEach(arquivo => fs.unlink(arquivo.path, () => {}));

        return res.status(400).json({
            erro: 'Um dos arquivos enviados não é uma imagem válida.'
        });
    }

    next();
}

module.exports = {
    upload,
    conferirImagens,
    pastaUploads
};