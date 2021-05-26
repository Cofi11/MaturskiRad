const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({//odgovori su ili niz 0 i 1, ili tekst
    string: {
        type: String
    },
    array: [{
        type: Number
    }]
},{ _id: false});

const resultSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {//ako je assign preko linka
        type: String
    },
    name: {//ako je assign preko linka
        type: String
    },
    questionOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    answers: [{
        type: answerSchema,
        required: true
    }],
    autoPoints: [{ //za svako pitanje
        type: Number,
        required: true,
        default: 0
    }],
    points: [{
        type: Number,
        required: true,
        default: -1 //dok profesor ne pregleda
    }]
});

const result = mongoose.model('result',resultSchema);

module.exports = result;