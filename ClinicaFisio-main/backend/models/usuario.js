const mongoose = require('mongoose');

const UsuarioSchema =
    new mongoose.Schema({

        nome: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        senhaHash: {
            type: String,
            required: true
        },

        papel: {
            type: String,
            enum: [
                'admin',
                'user'
            ],
            required: true
        },

        pacienteId: {
            type: String,
            default: null
        }

    }, {
        timestamps: true
    });


module.exports =
    mongoose.model(
        'Usuario',
        UsuarioSchema
    );