const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Question = require('../models/question');
const Test = require('../models/test');
const Group = require('../models/group');
const Exam = require('../models/exam');
const Result = require('../models/result');

const checkAuthenticated = require('../passport-auth').checkAuthenticated;
//const checkNotAuthenticated = require('../passport-auth').checkNotAuthenticated;

router.get('/', checkAuthenticated , async function(req,res){
    try{
        const tests = await Test.find({createdBy: req.user.id}); //svaki user vidi samo svoje testove
        const exams = await Exam.find({teacher: req.user.id})
                                        .populate('test').exec();
        //console.log(exams);
        res.render('alltests', {
            tests: tests,
            exams: exams
        });
    }
    catch{
        res.redirect('/');
    }
    //console.log(req.user);
});


router.get('/new', checkAuthenticated, async function(req, res){
    try{
        const questions = await Question.find({createdBy: req.user.id});
        res.render('newtest', {questions: questions});
    }
    catch{
        res.render('newtest');
    }
    
});

//form action
router.post('/new', checkAuthenticated, async function(req, res){
    //res.send(req.body);
    console.log(req.body);
    //za pitanja
    const questions = []; 
    const answerTextString = 'answer_text_Q';
    const correctAnswerString = 'correctanswer';
    const statementTextString = 'statement_text_Q';
    let searchString = [];

    const test = new Test({
        name: req.body.testname,
        duration: req.body.testduration
        //pitanja dodajemo u while posle;
    });
    let ok=true; //da l je svako pitanje lepo sacuvano, samo ako jeste cuva se test;

    let i=0;
    let i1=0;//imena iz req.body ne idu redom i neki broj moze biti preskocen pa i1 povecavamo dok ne nadjemo prvi sledeci podatak koji nam treba a i ostaje isto
    let tf; //true kad nadjemo za i1 i onda povecavamo i, inace false i onda i ne diramo
    let max;
    if(Array.isArray(req.body.question_text)){
        max= req.body.question_text.length;
    }
    else if(req.body.question_text != null){
        max=1;
    }
    else max=0;
    //console.log(max);

    while(i<max){
        if(max !== 1){ //tada imamo niz za neke podatke
            questions[i]= new Question({
                questionText: req.body.question_text[i],
                questionType: req.body.type_of_question[i],
                maxPoints: req.body.question_maxpoints[i]
            });
        }
        else{ //tada imamo string jer je samo jedno pitanje
            questions[i]= new Question({
                questionText: req.body.question_text,
                questionType: req.body.type_of_question,
                maxPoints: req.body.question_maxpoints
            });
        }

        //zavisi od tipa pitanja, deo za dodavanje answerText u tabelu baze
        if(questions[i].questionType == 'choose-answer'){
            searchString[i]=answerTextString+(i1+1);
            questions[i].answersText=req.body[searchString[i]];
            if(questions[i].answersText == null){
                i1++;
                tf= false;
            }
            else{
                tf=true;
                //sad nalazimo koji checkbox je/su 'on', tj. tacne odgovore; koristimo istu promenljivu searchString jer nam vise ne treba
                searchString[i]='answercheck'+(i1+1);
                questions[i].correct=req.body[searchString[i]]; 
            }
        }
        else if(questions[i].questionType == 'type-answer'){
            searchString[i]=correctAnswerString+(i1+1);
            questions[i].answersText=req.body[searchString[i]];
            if(questions[i].answersText == null){
                i1++;
                tf= false;
            }
            else{
                tf=true;
            }
        }
        else if(questions[i].questionType == 'true-false'){
            searchString[i]=statementTextString+(i1+1);
            questions[i].answersText=req.body[searchString[i]];
            if(questions[i].answersText == null){
                i1++;
                tf= false;
            }

            else{
                tf=true;
                //sad nalazimo koji checkbox je/su 'T','F'; koristimo istu promenljivu searchString jer nam vise ne treba
                let j=0;
                let j1=0;//slicno kao i1 sluzi da nadje sledeci indeks koji postoji
                searchString[i] = 'check_tf'+(i1+1)+'_';
                let string1;
                while(j<questions[i].answersText.length){
                    string1 = searchString[i]+(j1+1);
                    //console.log(string1);
                    if(req.body[string1]==null){
                        j1++;
                    }
                    else{
                        if(req.body[string1]=='true'){
                            questions[i].correct.push(1);//pazi ovaj push u editu, pre toga isprazni stari correct niz
                        }
                        else{
                            questions[i].correct.push(0);
                        }
                        //console.log(question.correct);
                        j++;
                        j1++;
                    }
                }
            }
        }
        
        if(tf){    
            if(req.user){
                questions[i].createdBy=req.user.id;
            }

            console.log(questions[i]);

            //cuvanje u bazu
            try {
                await questions[i].save();
                console.log('Sacuvano pitanje');
            } catch {
                console.log('greska za pitanje');
                ok=false;
            }

            test.questions.push(questions[i].id);

            i++;
            i1++;
        }
    }

    //dodavanje vec postojecih pitanja u test
    let niz = req.body.existing_questions;//string ID
    let nizID = [];
    if(niz != null){
        if(Array.isArray(niz)){
            max= niz.length;
            let j=0;
            while(j<max){
                niz[j].trim();//jednom mi je dodao space na kraju stringa za ID
                nizID[j] = mongoose.Types.ObjectId(niz[j]);
                console.log(nizID[j]);
                test.questions.push(nizID[j]);
                j++;
            }
        }
        else{
            niz.trim();
            nizID[0] = mongoose.Types.ObjectId(niz);
            console.log(nizID[0]);
            test.questions.push(nizID[0]);
        }
        
    }
    else if(max==0){//ovo je stari max iz proslog while ako je 0 nema novih pitanja, sto onda sad zanci da nema pitanja uopse sto je greska 
        ok=false;
    }

    //da se zna koji user napravio
    if(req.user){
        test.createdBy=req.user.id;
    }

    //cuvanje celog testa u DB
    if(!ok){
        res.render('newtest',{
            test: test,
            questions: questions,
            errorMessage: 'Error creating a test'
        });
        console.log('Greska za neko pitanje pa nisam sacuvao ni test');
    }
    else{
       try{
            await test.save();
            console.log('Sacuvan Test');
            res.redirect('/tests');
        }
        catch{
            res.render('newtest',{
                test: test,
                errorMessage: 'Error creating a test'
            });
            console.log('greska za test');
        }
    }
    
})

//odredjeni test
router.get('/:id', checkAuthenticated, checkUser, async function(req,res){ 
    try{
        const test = await Test.findById(req.params.id)
                                .populate('questions').exec();
        const questions = test.questions;

       // console.log(questions);

        res.render('showtest', {
            test: test,
            questions: questions
        })
    }
    catch{
        res.redirect('/');
    }
    
})

//edit odredjenog testa, samo izgled strane
router.get('/:id/edit', checkAuthenticated , checkUser, async function(req,res){ 
    let test;
    let questions;
    let otherQuestions; //sva preostala, treba nam za dodavanje postojecih pitanja u test
    try{
        test = await Test.findById(req.params.id)
                                .populate('questions').exec();
        questions = test.questions;
        otherQuestions = await Question.find({_id:{$nin: questions}, createdBy:req.user.id});//not in
        res.render('edittest', {
            test: test,
            questions: questions,
            otherQuestions: otherQuestions
        });
    }
    catch{
        res.redirect('/');
    }
})

//edit request
router.put('/:id', checkAuthenticated , checkUser, async function(req,res){
    console.log(req.body);

    let test;
    let prevQuestions = []; //pitanja u testu pre edita
    try{
        test = await Test.findById(req.params.id).populate('questions').exec();
        test.name = req.body.testname;
        test.duration = req.body.testduration;
        //prevQuestions = test.questions;
        for(let i=0 ; i<test.questions.length ; i++){
            prevQuestions[i]=test.questions[i];
        }
        test.questions=[];
        
        //console.log(test);
        //console.log(prevQuestions);


        //SAD IDE DOSTA SLICNO KAO I U POST METHOD
        const questions = []; 
        const answerTextString = 'answer_text_Q';
        const correctAnswerString = 'correctanswer';
        const statementTextString = 'statement_text_Q';
        let searchString = [];

        let ok=true; //da l je svako pitanje lepo sacuvano, samo ako jeste cuva se test;

        let i=0;
        let i1=0;//imena iz req.body ne idu redom i neki broj moze biti preskocen pa i1 povecavamo dok ne nadjemo prvi sledeci podatak koji nam treba a i ostaje isto
        let i2; //samo u editu, to mi je za poredjenje prevQuestions i questions
        let tf; //true kad nadjemo za i1 i onda povecavamo i, inace false i onda i ne diramo
        let max;
        //let max1; //samo u editu, manji od max i duzine prevQuestions;
        if(Array.isArray(req.body.question_text)){
            max= req.body.question_text.length;
        }
        else if(req.body.question_text != null){
            max=1;
        }
        else max=0;
        //console.log(max);

        while(i<max){
            if(max !== 1){ //tada imamo niz za neke podatke
                questions[i]={
                    questionText: req.body.question_text[i],
                    questionType: req.body.type_of_question[i],
                    maxPoints: req.body.question_maxpoints[i],
                    id: req.body.idQ[i]
                };
            }
            else{ //tada imamo string jer je samo jedno pitanje
                questions[i]={
                    questionText: req.body.question_text,
                    questionType: req.body.type_of_question,
                    maxPoints: req.body.question_maxpoints,
                    id: req.body.idQ
                };
            }

            //zavisi od tipa pitanja
            if(questions[i].questionType == 'choose-answer'){
                searchString[i]=answerTextString+(i1+1);
                questions[i].answersText=req.body[searchString[i]];
                if(questions[i].answersText == null){
                    i1++;
                    tf= false;
                }
                else{
                    tf=true;
                    //sad nalazimo koji checkbox je/su 'on', tj. tacne odgovore; koristimo istu promenljivu searchString jer nam vise ne treba
                    searchString[i]='answercheck'+(i1+1);
                    questions[i].correct=req.body[searchString[i]]; 
                }
            }
            else if(questions[i].questionType == 'type-answer'){
                searchString[i]=correctAnswerString+(i1+1);
                questions[i].answersText=req.body[searchString[i]];
                if(questions[i].answersText == null){
                    i1++;
                    tf= false;
                }
                else{
                    tf=true;
                }
            }
            else if(questions[i].questionType == 'true-false'){
                searchString[i]=statementTextString+(i1+1);
                questions[i].answersText=req.body[searchString[i]];
                if(questions[i].answersText == null){
                    i1++;
                    tf= false;
                }

                else{
                    questions[i].correct = [];
                    tf=true;
                    //sad nalazimo koji checkbox je/su 'T','F'; koristimo istu promenljivu searchString jer nam vise ne treba
                    let j=0;
                    let j1=0;//slicno kao i1 sluzi da nadje sledeci indeks koji postoji
                    searchString[i] = 'check_tf'+(i1+1)+'_';
                    let string1;
                    while(j<questions[i].answersText.length){
                        string1 = searchString[i]+(j1+1);
                        //console.log(string1);
                        if(req.body[string1]==null){
                            j1++;
                        }
                        else{
                            if(req.body[string1]=='true'){
                                questions[i].correct.push(1);
                            }
                            else{
                                questions[i].correct.push(0);
                            }
                            //console.log(question.correct);
                            j++;
                            j1++;
                        }
                    }
                }
            }
            
            if(tf){    

                if(!Array.isArray(questions[i].answersText)){// mora niz da bi mogla da se postigne jednakost u JSON.stringify posle kad je samo jedan element niza;
                    console.log('nije bio niz dosad');
                    let pom=questions[i].answersText;
                    questions[i].answersText=[];
                    questions[i].answersText.push(pom);
                }
                console.log(questions[i]);

                i2=i;
                //NE RADI max1=Math.min(max,prevQuestions.length);
                //console.log(max1);
                while(i2<prevQuestions.length){
                    if(questions[i].id == prevQuestions[i2].id){
                        console.log('zemo '+i2);
                        //console.log(JSON.stringify(questions[i].correct.map(Number)));
                        //console.log(JSON.stringify(prevQuestions[i2].correct));
                        console.log(prevQuestions[i2]);
                        if(questions[i].questionText == prevQuestions[i2].questionText &&
                            questions[i].questionType == prevQuestions[i2].questionType &&
                            questions[i].maxPoints == prevQuestions[i2].maxPoints &&
                            JSON.stringify(questions[i].answersText) === JSON.stringify(prevQuestions[i2].answersText)){
                                if(!questions[i].correct || (JSON.stringify(questions[i].correct.map(Number)) === JSON.stringify(prevQuestions[i2].correct))){
                                    console.log('svee isto');
                                    test.questions.push(prevQuestions[i2].id);
                                }
                                else{
                                    console.log('nesto editovano');
                                    i2=prevQuestions.length;
                                }
                            }
                        else{
                            console.log('nesto editovano');
                            i2=prevQuestions.length;
                        }

                        break;
                    }
                    else{
                        console.log('ne zemo '+i2);
                    }
                    i2++;
                }
                if(i2 >= prevQuestions.length){
                    let editedQuestion = new Question({
                        questionText: questions[i].questionText,
                        questionType: questions[i].questionType,
                        maxPoints: questions[i].maxPoints,
                        answersText: questions[i].answersText,
                        correct: questions[i].correct,
                        createdBy: req.user.id
                    });
                    console.log(editedQuestion);
                    
                    try {
                        await editedQuestion.save();
                        console.log('Sacuvano pitanje');
                    } catch {
                        console.log('greska za pitanje');
                        ok=false;
                    }
                    test.questions.push(editedQuestion.id);
                }


                i++;
                i1++;
            }
        }

        //dodavanje vec postojecih pitanja u test
        let niz = req.body.existing_questions;//string ID
        let nizID = [];
        if(niz != null){
            if(Array.isArray(niz)){
                max= niz.length;
                let j=0;
                while(j<max){
                    niz[j].trim();//jednom mi je dodao space na kraju stringa za ID
                    nizID[j] = mongoose.Types.ObjectId(niz[j]);
                    console.log(nizID[j]);
                    test.questions.push(nizID[j]);
                    j++;
                }
            }
            else{
                niz.trim();
                nizID[0] = mongoose.Types.ObjectId(niz);
                console.log(nizID[0]);
                test.questions.push(nizID[0]);
            }
            
        }
        else if(max==0){//ovo je stari max iz proslog while ako je 0 nema novih pitanja, sto onda sad zanci da nema pitanja uopse sto je greska 
            ok=false;
        }

        /*if(req.user){ vrv mi ne treba ovo, ali nista ne menja
            test.createdBy=req.user.id;
        }
        else{
            console.log('neulogovan');
        }*/

        //console.log(test);

        if(ok){
            await test.save();
            console.log('Sacuvan test');
            res.redirect(`/tests/${test.id}`);
        }
    }
    catch(e){
        console.log(e);
        if(test == null){
            res.redirect('/');
        }
        else{
            //samo ovaj render srediti jos
            /*res.render('edittest', {
                test: test,
                questions: prevQuestions,
                errorMessage: 'Error updating a test'
            });*/
            console.log('greska za test');
        }
    }
})

//delete request, mozemo koristit method-override module
//zasad koristim fetch api
router.delete('/:id', checkAuthenticated , checkUser, async function(req,res){
    let test;
    try{
        test = await Test.findById(req.params.id);
        await test.remove();
        res.json({redirect: '/tests'});
    }
    catch{
        if(test == null){
            console.log('Greska u trazenju');
            res.json({redirect: '/'});
        }
        else{
            console.log('Greska u brisanju');
            res.json({redirect: '/tests', error:'This test is used in at least one exam so it cannot be deleted'}); //mzd dodati neku poruku za error
        }
    }
})

router.get('/:id/assign', checkAuthenticated , checkUser, async function(req,res){ 
    try{
        const test = await Test.findById(req.params.id)
                                .populate('questions').exec();
        const questions = test.questions;
        const groups = await Group.find({groupAdmins: req.user.id})
                                .populate('groupAdmins')
                                .populate('groupMembers').exec();
        const members = [];//svi clanovi svake grupe
        const usernames = [];//samo username treba predati frontendu
        let usernames2 = [];
        for(let i=0 ; i<groups.length ; i++){
            usernames2=[];
            members[i]=groups[i].groupAdmins.concat(groups[i].groupMembers);
            for(let j=0 ; j<members[i].length ; j++){
                usernames2.push(members[i][j].username);
            }
            usernames.push(usernames2);
           // console.log(usernames[i]);
        }

        res.render('assigntest', {
            test: test,
            questions: questions,
            groups: groups,
            usernames: usernames
        })
    }
    catch(e){
        console.log(e);
        res.redirect('/');
    }
})

router.post('/:id/assign', checkAuthenticated , checkUser, async function(req,res){
    console.log(req.body);

    let start;
    let end;

    let today = new Date();
    today=today.toISOString();
    /*console.log(today.split('T')[0]);
    console.log(today.split('T')[1]);*/
    let dateNow=today.split('T')[0];
    let timeNow=today.split('T')[1];

    //za startsAt
    if(req.body.date_start != '' && req.body.date_start != null){
        if(req.body.time_start != '' && req.body.time_start != null){
            start=req.body.date_start + 'T' + req.body.time_start;
        }
        else if(req.body.date_start != dateNow){
            start=req.body.date_start + 'T' + timeNow;
        }
        else{
            start=req.body.date_start + 'T00:00:00';
        }
    }
    else{
        if(req.body.time_start != '' && req.body.time_start != null){
            start=dateNow + 'T' + req.body.time_start;
        }
        else{
            start=dateNow + 'T' + timeNow;
        }
    }

    //za endsAt
    if(req.body.date_end != '' && req.body.date_end != null){
        if(req.body.time_end != '' && req.body.time_end != null){
            end=req.body.date_end + 'T' + req.body.time_end;
        }
        else{
            end=req.body.date_end + 'T23:59:59';
        }
    }
    //else ostace samo undefined
    
    let startsAt = new Date(start);
    let endsAt;
    if(end){
        endsAt = new Date(end);
        //console.log(endsAt);
    }
    console.log(startsAt);
    console.log(endsAt);

    let random;

    if(req.body.random){
        random=true;
    }
    else{
        console.log('nema randoma');
        random=false;
    }

    const exam = new Exam({
        test: req.params.id,
        teacher: req.user.id,
        startsAt: startsAt,
        endsAt: endsAt,
        random: random
    })
    let group;
    let emails
    if(req.body.group){
        try{
            group = await Group.findOne({code: req.body.group});
            exam.group = group.id;
        }
        catch{
            res.redirect(`/tests/${req.params.id}/assign`);
            return;
        }
        console.log(group);
    }
    else{//samo tad moze da bude emailova iz whitelist
        console.log('nema grupe');
        if(req.body.emails && req.body.emails.length > 0){
            emails = req.body.emails;
            exam.emails=emails;
        }
    }

    console.log(exam);

    try{
        await exam.save();
        console.log('Test assigned');
        res.redirect(`/tests/${exam.id}/exam`);
    }
    catch(e){
        console.log('greska-nije assignovano');
        console.log(e);
        req.flash('info', 'Test was not assigned');
        res.redirect('/tests');
    }
})

router.get('/:id/exam', checkFirst, async function(req,res){
    try{
        const responses = await Result.find({exam: req.params.id})
                                    .populate('user');
        const exam = await Exam.findById(req.params.id)
                                .populate({
                                    path: 'test',
                                    populate:{
                                        path: 'questions'
                                    }
                                })
                                .populate('group').exec();
        const test = exam.test;
        let questions = test.questions;
        let group = exam.group;
        //console.log(questions);

        let randomQuestions=randomOrder(questions);
        //console.log(randomQuestions);
        if(exam.random){
            questions = randomQuestions;
        }
        let dateNow = new Date();
        let status; //0, 1, 2 : nije poceo, traje, gotov;
        //console.log(dateNow);
        if(exam.startsAt > dateNow){
            console.log('nije poceo test');
            status=0;
        }
        else if(exam.endsAt && exam.endsAt < dateNow){
            console.log('gotov test');
            status=1;
        }
        else{
            console.log('traje test');
            status=2;
        }

        if(!group){//ako nije assignovano grupi, vec preko linka
            let emails = exam.emails; //samo ovi mejlovi ce moci da postuju resenja testa
            if(req.user && exam.teacher == req.user.id){
                res.render('examteacher',{//jos uvek treba srediti
                    name: test.name,
                    status: status,
                    link: true,
                    examId: exam.id,
                    startsAt: exam.startsAt,
                    endsAt: exam.endsAt,
                    responses: responses
                });
                return;
            }
            else{
                res.render('dotest', {
                    test: test,
                    questions: questions,
                    link: true, 
                    emails: emails, //treba da proveri dal je unet input email jedan od ovih
                    status: status,
                    startsAt: exam.startsAt,
                    endsAt: exam.endsAt
                })
                return;
            }
        }
        else{//ako je assignovano grupi
            let members = group.groupAdmins.concat(group.groupMembers);
            //console.log(members);
            if(req.user && exam.teacher == req.user.id){
                res.render('examteacher',{//jos uvek treba srediti
                    name: test.name,
                    link: false,
                    group: group,
                    status: status,
                    startsAt: exam.startsAt,
                    endsAt: exam.endsAt,
                    responses: responses
                });
                return;
            }
            else if(req.user && members.includes(req.user.id)){
                res.render('dotest', {
                    test: test,
                    questions: questions,
                    link: false,
                    status: status,
                    startsAt: exam.startsAt,
                    endsAt: exam.endsAt
                })
                return;
            }
            else if(req.user){
                req.flash('info','No permission to acces this exam');
                res.redirect('/');
                return;
            }
            else{
                req.flash('info','No permission to acces. You are not logged in');
                res.redirect('/');
                return;
            }
        }
    }
    catch(e){
        console.log(e);
        res.redirect('/');
    }
    
})

router.post('/:id/exam', checkFirst, async function(req,res){
   // res.send(req.body);
    let questionOrder = req.body.questionsId;
    const questions = [];
    let exam;
    let group;
    try{
        exam = await Exam.findById(req.params.id)
                            .populate('group').exec();
        group = exam.group;
        for(let i=0 ; i<questionOrder.length ; i++){
            questionOrder[i].trim();
            questionOrder[i]=mongoose.Types.ObjectId(questionOrder[i]);
            questions[i]=await Question.findById(questionOrder[i]);
        }
        //console.log(questionOrder);
    }
    catch{
        req.flash('info','Error: Not found'); //ovo ne bi trebalo nikad da se desi
        res.redirect('/');
        console.log('greska');
        return;
    }
    const result = new Result({//dodajemo posle ostale podatke
        exam: req.params.id,
        questionOrder: questionOrder
    });
    //console.log(questions);
    //console.log(group);
    //console.log(exam.emails);
    if(group){
        let members=group.groupAdmins.concat(group.groupMembers);
        if(req.user && members.includes(req.user.id)){//ulogavan i clan grupe
            result.user = req.user.id;
        }
        else if(req.user){ //nemoguce - ulogovan al nije clan grupe
            req.flash('info','No permission to submit this exam');
            res.redirect('/');
            return;
        }
        else{//nije cak ni ulogovan
            req.flash('info','No permission to submit. You are not logged in');
            res.redirect('/');
            return;
        }
    }
    else{
        if(exam.emails.length==0 || exam.emails.includes(req.body.student_email)){
            result.email = req.body.student_email;
            result.name = req.body.student_name;
        }
        else{
            req.flash('info','No permission to submit with this email');
            res.redirect(`/tests/${exam.id}/exam`);
            return;
        }
    }

    let autoPoints = []; //zasad samo ako se sve poklapa dobija maxPoints za dato pitanje
    let searchstring;
    let answers = [];
    let j;
    let tfarray;
    for(let i=0 ; i<questions.length ; i++){
        //autoPoints[i]=0;
        if(questions[i].questionType=='choose-answer'){
            searchstring = 'answercheck'+(i+1);
            answers[i]={
                array: req.body[searchstring]
            }
        }
        else if(questions[i].questionType=='true-false'){
            j=0;
            tfarray = [];
            for(j ; j<questions[i].correct.length ; j++){
                searchstring = 'check_tf'+(i+1)+'_'+(j+1);
                if(!req.body[searchstring]){
                    tfarray[j]=-1;
                }
                else if(req.body[searchstring] == 'true'){
                    tfarray[j]=1;
                }
                else if(req.body[searchstring] == 'false'){
                    tfarray[j]=0;
                }
            }
            answers[i]={
                array: tfarray
            }
        }
        else if(questions[i].questionType=='type-answer'){
            searchstring = 'typeanswer'+(i+1);
            answers[i]={
                string: req.body[searchstring]
            }
        }
        //console.log(answers[i]);
        result.answers.push(answers[i]);

        autoPoints[i]=automatic(result.answers[i], questions[i]);//funkcija koja radi automatski pregled svakog pitanja

        result.autoPoints=autoPoints;
    }

    console.log(result);

    let date = new Date();
    let oktime;

    if(exam.startsAt < date && !exam.endsAt){
        oktime=true;
    }
    else if(exam.startsAt < date && exam.endsAt > date){
        oktime=true;
    }
    else{
        oktime=false;
    }
    
    //SAD SAVE resulta
    if(!oktime){
        req.flash('info','Time has passed. Your test was not submitted');
        res.redirect(`/tests/${exam.id}/exam`);
        console.log('isteklo vreme');
    }
    else{
        try{
            await result.save();
            console.log('Uradjen test');
            res.redirect(`/tests/${result.id}/results`);
        }
        catch{
            console.log('Greska pri predaji testa');
            res.redirect(`/tests/${exam.id}/exam`);
        }
    }

})


router.get('/:id/results', async function(req,res){
    try{
        const result = await Result.findById(req.params.id)
                                    .populate({
                                        path: 'exam',
                                        populate: {
                                            path: 'test'
                                        }
                                    })
                                    .populate('questionOrder')
                                    .populate('user').exec();
        const exam = result.exam;
        const test = exam.test;
        const questions = result.questionOrder;
        
        let dateNow = new Date();
        let status; //0, 1, 2 : nije poceo, traje, gotov;
        if(exam.startsAt > dateNow){//NEMOGUCE da se desi
            res.redirect('/');
            return;
        }
        else if(exam.endsAt && exam.endsAt < dateNow){
            status=1;//gotov tako da mozemo da pokazemo rezultate
        }
        else if(!exam.endsAt){
            status=3;//exam bez kraja, pa moramo da pokazemo rezultate
        }
        else{
            status=2;//nije gotov pa ne pokazujemo rezultate uceniku
        }

        if(req.user && exam.teacher == req.user.id){
            let username;
            if(result.email){
                username=result.name;
            }
            else{
                username=result.user.username;
            }
            res.render('resultteacher',{
                id: result.id,
                username: username,
                email: result.email,
                testname: test.name,
                questions: questions,
                answers: result.answers,
                autoPoints: result.autoPoints,
                points: result.points
            });
            return;
        }
        else if(req.user && req.user.id == result.user.id){//assigne preko grupe ima usera, samo taj user pristupa svojim rezultatima
            //console.log('assign preko grupe uspeo');
            res.render('resultstudent', {
                username: result.user.username,
                email: null,
                status: status,
                testname: test.name,
                questions: questions,
                answers: result.answers,
                autoPoints: result.autoPoints,
                points: result.points,
                endsAt: exam.endsAt
            });
            return;
        }
        else if(req.user && result.user){//ulogovan user al neki drugi pa ne moze da pristupi
            //console.log('assign preko grupe nije uspeo1');
            req.flash('info','No permission to access');
            res.redirect('/');
            return;
        }
        else if(result.user){//nije ulogovan pa ne moze da pristupi
            //console.log('assign preko grupe nije uspeo2');
            req.flash('info','No permission to access. You are not logged in');
            res.redirect('/');
            return;
        }
        else{//assign preko linka, svako moze da pristupi pa cak i nekom tudjem rezultatu jer ne znam bas kkao to da zabranim
            res.render('resultstudent', {
                username: result.name,
                email: result.email,
                status: status,
                testname: test.name,
                questions: questions,
                answers: result.answers,
                autoPoints: result.autoPoints,
                points: result.points,
                endsAt: exam.endsAt
            });
            return;
        }
    }
    catch{
        res.redirect('/');
    }
})

router.put('/:id/results', checkAuthenticated, async function(req,res){
    try{
        const result = await Result.findById(req.params.id).
                                    populate('exam').exec();
        const exam = result.exam;
        if(exam.teacher != req.user.id){//ne moze da pregledda ako nije teacher
            req.flash('info','No permission to review this test');
            res.redirect('/tests');
            return;
        }                            
        //console.log(result.points);
        result.points = req.body.points;
        //console.log(result.points);

        await result.save();
        res.redirect(`/tests/${exam.id}/exam`);
    }
    catch{
        res.redirect('/');
    }
})



function automatic(answer, question){
    let points=0;
    if(question.questionType == 'choose-answer'){
        if(JSON.stringify(answer.array) === JSON.stringify(question.correct)){//poredjenje nizova je malo cudno vljd ovo radi uvek
            points=question.maxPoints;
        }
    }
    else if(question.questionType == 'type-answer'){
        if(question.answersText.includes(answer.string)){
            points=question.maxPoints;
        }
    }
    else if(question.questionType == 'true-false'){
        for(let i=0 ; i<question.correct.length ; i++){
            if(answer.array[i] == question.correct[i]){
                points+=(question.maxPoints/question.correct.length);
            }
        }
    }
    return points;
}


async function checkUser(req,res,next){//da li je pravi user; ne moze se pristupiti testovima drugog usera
    try{
        const test = await Test.findById(req.params.id);
        if(test.createdBy == req.user.id)return next();
        req.flash('info', 'No permission to acces');
        res.redirect('/');
    }
    catch{
        console.log('greska');
        res.redirect('/');
    }
}

async function checkFirst(req,res,next){//da li mu je prvi put da pristupa testu, ako je vec uradio test ne moze opet
    try{
        if(req.user){
            //console.log('postoji user');
            const result = await Result.find({exam: req.params.id, 
                                                  user:req.user.id});
            if(result.length==0){//nije dosad radio ovaj exam
                return next();
            }
            req.flash('info', 'You have already done this test');
            res.redirect(`/groups/${result.group}`); 
            return;  
        }
        console.log(req.body);
        if(req.body.student_email){//za assign preko linka jedino ima smisla spreciti post ako je vec isti email koriscen
            //console.log('post preko linka');
            const email = req.body.student_email;
            const result = await Result.find({exam: req.params.id, 
                                              email: email});
            if(result.length==0){//nije dosad radio ovaj exam
                return next();
            }
            req.flash('info', 'You have already done this test');
            res.redirect('/'); 
            return;
        }
        return next();
    }
    catch{
        console.log('greska');
        res.redirect('/');
    }
}


function randomOrder(questions){//random redosled pitanja;
    let index;
    let questions2 = [];
    let i=0;
    while(questions.length>0){
        index= Math.floor(Math.random()*questions.length);
        //console.log(index);
        questions2[i]=questions[index];
        i++;
        questions = removeIndex(questions, index);
    }
    return questions2;   
}

function removeIndex(questions, index){//brise element na datom indeksu iz niza
    let questions2 = [];
    let i=0;
    for(i ; i<index ; i++){
        questions2[i]=questions[i];
    }//izlazak kad je i=index
    i++;
    for(i ; i<questions.length ; i++){
        questions2[i-1]=questions[i];
    }
    //console.log(questions2);
    return questions2;
}

module.exports = router;