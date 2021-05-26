const mongoose = require('mongoose');

const Test = require('../models/test');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true
    },
    maxPoints: {
        type: Number,
        required: true
    },
    answersText: [{
        type: String,
        required: true
    }],
    correct: [{ //koristicemo za sve tipove pitanja sa vise opcija;
        type: Number,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


questionSchema.pre('remove', function(next){//ne smemo brisati ako se pitanje koristi u nekom testu
    Test.find({questions: this.id}, function(err,tests){
        if(err){
            next(err); //samo ako nes zabode u DB
        }
        else if(tests.length>0){
            next(new Error('This question is used in at least one test so it cannot be deleted'));
        }
        else{
            next();
        }
    })
})

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;