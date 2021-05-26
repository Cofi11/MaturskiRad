const express = require('express');
const router = express.Router();

const Question = require('../models/question');
const Test = require('../models/test');

const checkAuthenticated = require('../passport-auth').checkAuthenticated;
//const checkNotAuthenticated = require('../passport-auth').checkNotAuthenticated;

router.get('/', checkAuthenticated , async function(req,res){
    try{
        const questions = await Question.find({createdBy: req.user.id});//svaki user samo svoja pitanja vidi
        res.render('allquestions', {questions: questions});
    }
    catch{
        res.redirect('/');
    }
});

router.get('/new', checkAuthenticated, function(req,res){
    res.render('newquestion');
});

router.post('/new', checkAuthenticated, async function(req,res){
    console.log(req.body);

    let question = new Question({
        questionText: req.body.question_text,
        questionType: req.body.type_of_question,
        maxPoints: req.body.question_maxpoints
    });
    if(question.questionType == 'choose-answer'){
        question.answersText=req.body.answer_text_Q1;
        question.correct=req.body.answercheck1;
    }
    else if(question.questionType == 'type-answer'){
        question.answersText=req.body.correctanswer1;
    }
    else if(question.questionType == 'true-false'){
        question.answersText=req.body.statement_text_Q1;
        let i=0;
        let j=0;//nadje sledeci indeks koji postoji
        let string = 'check_tf1_';
        let string1;
        while(i<question.answersText.length){
            string1 = string+(j+1);
            if(req.body[string1]==null){
                j++;
            }
            else{
                if(req.body[string1]=='true'){
                    question.correct.push(1);
                }
                else{
                    question.correct.push(0);
                }
                //console.log(question.correct);
                i++;
                j++;
            }
        }
    }

    //da se zna koji user napravio
    if(req.user){
        question.createdBy=req.user.id;
    }
    else{
        console.log('neulogovan');
    }

    console.log(question);

    try{
        await question.save();
        console.log('Sacuvano pitanje');
        res.redirect('/questions');
    }
    catch{
        res.render('newquestion', {
            question: question,
            errorMessage: 'Error creating a question'
        });
        console.log('greska za pitanje');
    }
});


router.get('/:id', checkAuthenticated  , checkUser, async function(req,res){
    try{
        const question = await Question.findById(req.params.id);
        const tests = await Test.find({questions: question.id});
        //console.log(tests);
        res.render('showquestion', {
            question: question,
            tests: tests
        })
    }
    catch{
        res.redirect('/');
    }
})

router.get('/:id/edit', checkAuthenticated , checkUser, async function(req,res){ 
    try{
        const question = await Question.findById(req.params.id);
        res.render('editquestion', {
            question: question,
        })
    }
    catch{
        res.redirect('/');
    }
})

//edit request
//method-override module da bi from slao PUT request
router.put('/:id', checkAuthenticated , checkUser, async function(req,res){
    console.log(req.body);

    let question;
    try{
        question = await Question.findById(req.params.id);
        question.questionText = req.body.question_text;
        question.questionType = req.body.type_of_question;
        question.maxPoints = req.body.question_maxpoints;
    
        if(question.questionType == 'choose-answer'){
            question.answersText=req.body.answer_text_Q1;
            question.correct=req.body.answercheck1;
        }
        else if(question.questionType == 'type-answer'){
            question.answersText=req.body.correctanswer1;
        }
        else if(question.questionType == 'true-false'){
            question.answersText=req.body.statement_text_Q1;
            let i=0;
            let j=0;//nadje sledeci indeks koji postoji
            let string = 'check_tf1_';
            let string1;
            question.correct=[];
            while(i<question.answersText.length){
                string1 = string+(j+1);
                if(req.body[string1]==null){
                    j++;
                }
                else{
                    if(req.body[string1]=='true'){
                        question.correct.push(1);
                    }
                    else{
                        question.correct.push(0);
                    }
                    //console.log(question.correct);
                    i++;
                    j++;
                }
            }
        }

        console.log(question);

            await question.save();
            console.log('Sacuvano pitanje');
            res.redirect(`/questions/${question.id}`);
    }
    catch{
        if(question==null){
            res.redirect('/');
        }
        else{
            res.render('editquestion', {
                question: question,
                errorMessage: 'Error updating a question'
            });
            console.log('greska za pitanje');
        }
    }
})

//delete request, mozemo koristit method-override module
//zasad koristim fetch api
router.delete('/:id', checkAuthenticated , checkUser, async function(req,res){
    let question;
    try{
        question = await Question.findById(req.params.id);
        await question.remove();
        res.json({redirect: '/questions'});
    }
    catch{
        if(question == null){
            console.log('Greska u trazenju');
            res.json({redirect: '/'});
        }
        else{
            console.log('Greska u brisanju');
            res.json({redirect: '/questions', error:'This question is used in at least one test so it cannot be deleted'}); //mzd dodati neku poruku za error
        }
    }
})


async function checkUser(req,res,next){//da li je pravi user; ne moze se pristupiti pitanjima drugog usera
    try{
        const question = await Question.findById(req.params.id);
        if(question.createdBy == req.user.id)return next();
        req.flash('info', 'No permission to access');
        res.redirect('/');
    }
    catch{
        console.log('greska');
        res.redirect('/');
    }
}

module.exports = router;