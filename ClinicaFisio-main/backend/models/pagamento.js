const mongoose = require('mongoose');

const PagamentoSchema =
    new mongoose.Schema({

        pacienteId: {
            type: String,
            required: true,
            index: true
        },

        descricao: {
            type: String,
            required: true,
            trim: true
        },

        data: {
            type: String,
            required: true
        },

        valor: {
            type: Number,
            required: true,
            min: 0.01
        },

        status: {
            type: String,
            enum: [
                'Pago',
                'Pendente'
            ],
            default: 'Pendente'
        },

        metodo: {
            type: String,
            default: 'Pix'
        }

    }, {
        timestamps: true
    });


module.exports =
    mongoose.model(
        'Pagamento',
        PagamentoSchema
    );