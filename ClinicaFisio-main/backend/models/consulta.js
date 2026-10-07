const mongoose = require('mongoose');

const ConsultaSchema = new mongoose.Schema({
    pacienteId: {
        type: String,
        required: true,
        index: true
    },

    tipo: {
        type: String,
        required: true,
        trim: true
    },

    data: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },

    horario: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):[0-5]\d$/
    },

    status: {
        type: String,
        enum: ['Confirmada', 'Pendente', 'Cancelada'],
        default: 'Pendente'
    },

    observacao: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

ConsultaSchema.index(
    { data: 1, horario: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['Confirmada', 'Pendente'] }
        }
    }
);

module.exports = mongoose.model('Consulta', ConsultaSchema);