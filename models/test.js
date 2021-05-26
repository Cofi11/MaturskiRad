const mongoose = require('mongoose');

const Exam = require('./exam');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    createdAt: {
        type: Date,
        required:true,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }
});

testSchema.pre('remove', function(next){//ne smemo brisati ako se test koristi u nekom examu
    Exam.find({test: this.id}, function(err,exams){
        if(err){
            next(err); //samo ako se desi greska u DB
        }
        else if(exams.length>0){
            next(new Error('This test is used in at least one exam so it cannot be deleted'));
        }
        else{
            next();
        }
    })
})

const Test = mongoose.model('Test',testSchema);

module.exports = Test;