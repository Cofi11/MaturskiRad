const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startsAt: {
        type: Date,
        required:true,
        default: Date.now//mzd mi i ne treba default
    },
    endsAt: {
        type: Date
    },
    random: {
        type: Boolean,
        required: true
    },
    group: { //ako je assignovano grupi
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    emails: [{ //ako je assignovano preko linka
        type: String
    }]
});

const Exam = mongoose.model('Exam',examSchema);

module.exports = Exam;