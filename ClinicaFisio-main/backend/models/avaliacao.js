const mongoose = require('mongoose');

const AvaliacaoSchema =
    new mongoose.Schema({

        pacienteId: {
            type: String,
            required: true,
            index: true
        },

        data: {
            type: String,
            required: true
        },

        peso: {
            type: String,
            default: ''
        },

        altura: {
            type: String,
            default: ''
        },

        dor: {
            type: String,
            default: ''
        },

        mobilidade: {
            type: String,
            default: ''
        },

        observacao: {
            type: String,
            default: ''
        },

        fotoAntes: {
            type: String,
            default: ''
        },

        fotoDepois: {
            type: String,
            default: ''
        }

    }, {
        timestamps: true
    });


module.exports =
    mongoose.model(
        'Avaliacao',
        AvaliacaoSchema
    );