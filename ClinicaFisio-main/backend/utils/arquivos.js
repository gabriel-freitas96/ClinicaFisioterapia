const fs = require('fs');
const path = require('path');
const { pastaUploads } = require('../middleware/upload');

function apagarFoto(caminho) {
    if (!caminho) return;
    const arquivo = path.join(pastaUploads, path.basename(caminho));
    fs.unlink(arquivo, () => {});
}

module.exports = { apagarFoto };