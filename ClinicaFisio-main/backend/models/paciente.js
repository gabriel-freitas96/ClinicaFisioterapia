const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, trim: true, default: 'Não informado' },
    motivoConsulta: { type: String, trim: true, default: 'Acompanhamento fisioterapêutico' }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', PacienteSchema);