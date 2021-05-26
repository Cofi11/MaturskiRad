let questionsCount = 1;
let currentQuestion = 1;

//let finish=false;

let firstQType = true;

//console.log(document.location.href);

if(document.location.href.includes('/new')){ //i za tests/new i za questions/new
    if(firstQType){//moze i bez ovoga firstQType je true;
        QuestionTypeChange();
        firstQType=false;
    }
   // console.log(20);
    //document.querySelector('#home').addEventListener('click',HomePage);
    document.getElementById('question-label1').textContent+=questionsCount;
    document.getElementById('question-label1').textContent+=':';
    // console.log(document.getElementById('question-label1').textContent);

    document.querySelector('.question-type-select').addEventListener('change',function(){
        whichQuestion(document.querySelector('.question-type-select'));
        QuestionTypeChange();
    });

    if(document.location.href.includes('tests/new')){//samo za tests/new
        document.querySelector('#addQuestion').addEventListener('click',addQuestion);//f-ja za dodavanje novih pitanja
        document.querySelector('#addQuestion2').addEventListener('click',addQuestion2);//f-ja za pregled postojecih pitanja
        
        let checkboxes = document.querySelectorAll('input[name="existing_questions"]');
        for(let i=0 ; i<checkboxes.length ; i++){
            checkboxes[i].addEventListener('change', function(){
                addedQuestions(checkboxes[i]); //funckija koja cekirana pitanja grupise u DIV za sva dodata postojeca pitanja
            });
        }
    }
}
else if(document.location.href.includes('/edit')){
    firstQType=false;
    if(document.location.href.includes('questions')){
        let question = document.querySelector('.question');
        editQuestionSetup(question);
    }
    else if(document.location.href.includes('tests')){
        //console.log('test');
        let questions = document.querySelectorAll('.question');
        for(let i=0 ; i<questions.length ; i++){
            editQuestionSetup(questions[i]);
            questionsCount++;
            currentQuestion=questionsCount;
        }
        questionsCount--;
        currentQuestion=questionsCount; //bice za jedan vece nego sto treba kad se napusti for
    
        //sve isto ko i tests/new
            document.querySelector('#addQuestion').addEventListener('click',addQuestion);//f-ja za dodavanje novih pitanja
            document.querySelector('#addQuestion2').addEventListener('click',addQuestion2);//f-ja za pregled postojecih pitanja
            
            let checkboxes = document.querySelectorAll('input[name="existing_questions"]');
            for(let i=0 ; i<checkboxes.length ; i++){
                checkboxes[i].addEventListener('change', function(){
                    addedQuestions(checkboxes[i]); //funckija koja cekirana pitanja grupise u DIV za sva dodata postojeca pitanja
                });
            }
    }
}
else if(document.location.href.includes('/exam')){
    let questions = document.querySelectorAll('.question');
    let checks = [];
        for(let i=0 ; i<questions.length ; i++){
            checks[i]=questions[i].querySelectorAll('input[type=checkbox]');
            console.log(checks[i]);
            let j = checks[i].length;
            for(let k=0 ; k<j ; k++){
                checks[i][k].addEventListener('change',function(){
                    console.log(checks[i][k]);
                    checkchange(checks[i][k].id);//slicno kao onechecked samo sluzi da kad je cekirano ne gledamo hidden.
                })
            }
        }
}
else{
    console.log(10);
   // document.querySelector('#newtest').addEventListener('click',CreateTestPage);
}

function editQuestionSetup(question){
   // firstQType = false;
    question.querySelector('.question-type-select').addEventListener('change',function(){
        whichQuestion(question.querySelector('.question-type-select'));
        QuestionTypeChange();
    });

    let button = question.querySelector('#addOption'+currentQuestion);//ovo je choose-answer type
    if(button){
        let answersDiv = question.querySelector('.answers');
        //console.log(answersDiv);
        let checks = answersDiv.querySelectorAll('input[type=checkbox]')
        oneChecked(checks[0].name);
        //console.log(checks);
        let i = checks.length;
        for(let j=0 ; j<i ; j++){
            checks[j].addEventListener('change',function(){
                oneChecked(checks[j].name);
            })
        }
        //console.log(i);
        button.addEventListener('click',function(){
            whichQuestion(button);
            i++;
            addOption(i, answersDiv);
        });
    }
    else {
        button=question.querySelector('#addStatement'+currentQuestion);// true-false type
        if(button){
            let answersDiv = question.querySelector('.answers');
            let checks = answersDiv.querySelectorAll('input[type=radio]')
            let i = checks[checks.length-1].dataset.num;
            //console.log(i);
            button.addEventListener('click',function(){
                whichQuestion(button);
                i++;
                addStatement(i, answersDiv);
            });
        }
    }

    let buttons =  question.querySelectorAll('.button4');
    let optionDivs = question.querySelectorAll('.answer-option');
    let parentDiv = question.querySelector('.answers');
    if(question.querySelector('.question-type-select').value=='choose-answer'){
        for(let i=0 ; i<buttons.length ; i++){
            buttons[i].addEventListener('click', function(){
                //console.log(optionDivs[i]);
                removeOption(optionDivs[i],parentDiv);
            });
        }
    }
    else if(question.querySelector('.question-type-select').value=='true-false'){
        for(let i=0 ; i<buttons.length ; i++){
            buttons[i].addEventListener('click', function(){
                //console.log(optionDivs[i]);
                removeStatement(optionDivs[i],parentDiv);
            });
        }
    }

    let deleteBtn = question.querySelector('.removeQ-btn');//naci ce ga samo u test editu
    if(deleteBtn){
        deleteBtn.addEventListener('click', function(){
            removeQuestion(question);
        })
    }
}



/*function CreateTestPage(){
    document.location='createTest';
}*/

function HomePage(){
    document.location='/';
}



function whichQuestion(Selected){//od currentQuestion mi negde zavisi ime pa je uvek bitno kad necemu novom dodeljujem ime,id da promenim currentQuestion
    if(Selected.className == 'question-type-select'){
        currentQuestion = Selected.id.slice(20);
    }
    else if(Selected.id.includes('addOption')){
        currentQuestion = Selected.id.slice(9);
    }
    else if(Selected.id.includes('addStatement')){
        currentQuestion = Selected.id.slice(12);
    }
    //console.log(currentQuestion);
}


function QuestionTypeChange(){
   // alert('promenio si');

    if(firstQType == false){
        let prevDiv = document.querySelector('#answers-question'+currentQuestion);
        prevDiv.remove();
    }
     

    let qType = document.querySelector('#question-type-select'+currentQuestion).value;

   // console.log(qType);

    let answersDiv = document.createElement('div');
    answersDiv.className='answers ';
    answersDiv.id='answers-question'+currentQuestion;

    if(firstQType){
        let question = document.querySelector('#question'+currentQuestion)
        question.appendChild(answersDiv);

        let scoringDiv = document.createElement('div');
        question.appendChild(scoringDiv);
        scoringDiv.className='question-scoring';
        scoringDiv.id='question-scoring'+currentQuestion;

        let pointsDiv = document.createElement('div');
        pointsDiv.className='question-points';
        pointsDiv.id='question-points'+currentQuestion;
        scoringDiv.appendChild(pointsDiv);

        let labelPoints = document.createElement('label');
        labelPoints.textContent = 'Enter maximum points for this question';
        pointsDiv.appendChild(labelPoints);
        
        let pointsArea = document.createElement('input');
        pointsArea.type='number';
        pointsArea.placeholder = 'Points';
        pointsArea.name='question_maxpoints';
        pointsArea.id='question-maxpoints'+currentQuestion;
        pointsArea.required=true;
        pointsArea.step='any';
        pointsArea.min=0;
        pointsDiv.appendChild(pointsArea);

        if(document.location.href.includes('tests')){
            let deleteDiv = document.createElement('div');
            question.appendChild(deleteDiv);
            deleteDiv.className='question-deleting';
            deleteDiv.id='question-deleting'+currentQuestion;

            let button = document.createElement('button');
            button.textContent='Remove question from the test';
            deleteDiv.appendChild(button);
            button.className='removeQ-btn';
            button.type='button';
            button.addEventListener('click', function(){
                removeQuestion(question);
            });
        }
    }
    else{
        let scoringDiv2=document.querySelector('#question-scoring'+currentQuestion);
        document.querySelector('#question'+currentQuestion).insertBefore(answersDiv,scoringDiv2);
    }


    if(qType == 'choose-answer'){
        let i=1;

        answersDiv.className+='answers-type1';

        let newOptionBtn = document.createElement('button');
        newOptionBtn.className='w3-button w3-circle w3-blue button3';
        newOptionBtn.textContent='+';
        newOptionBtn.id='addOption'+currentQuestion;
        newOptionBtn.type='button'; //default je submit jer je unutar forma
        answersDiv.appendChild(newOptionBtn);

        let newOptionText = document.createElement('p');
        newOptionText.textContent = 'Click to add new options/answers';
        newOptionText.className = 'text-add-option';
        answersDiv.appendChild(newOptionText);

        let checkText = document.createElement('p');
        checkText.textContent = 'Check the correct answer (you can check more than 1 option)'
        checkText.className = 'text-check';
        answersDiv.appendChild(checkText);

        addOption(i, answersDiv);
        i++;
        addOption(i, answersDiv);

        newOptionBtn.addEventListener('click',function(){
            whichQuestion(newOptionBtn);
            i++;
            addOption(i, answersDiv);
        });

    }

    else if(qType == 'type-answer'){

        let answerText = document.createElement('textarea');
        answersDiv.appendChild(answerText);
        answerText.placeholder='Enter correct answer';
        answerText.className='textarea1';
        answerText.required=true;
        answerText.id='correctanswer'+currentQuestion;
        answerText.name='correctanswer'+currentQuestion;

        let textBelow = document.createElement('p');
        let textBelowNode1 = document.createTextNode("You can add multiple possible corect answers/variatons separated by ;");
        let textBelowNode2 = document.createTextNode("Example: color;colour means both are correct answers");
        let newLine = document.createElement('br');
        textBelow.appendChild(textBelowNode1);
        textBelow.appendChild(newLine);
        textBelow.appendChild(textBelowNode2);
        answersDiv.appendChild(textBelow);
        textBelow.className='text-correct-variations';
    }

    else if(qType == 'true-false'){ //DOSTA SLICNO KAO I ZA choose-correct
        let i=1;

        answersDiv.className+='answers-type1';

        let newStatementBtn = document.createElement('button');
        newStatementBtn.className='w3-button w3-circle w3-blue button3';
        newStatementBtn.textContent='+'
        newStatementBtn.id='addStatement'+currentQuestion;
        newStatementBtn.type='button'; //deafult je submit jer je unutar forma
        answersDiv.appendChild(newStatementBtn);

        let newStatementText = document.createElement('p');
        newStatementText.textContent = 'Click to add new statement';
        newStatementText.className = 'text-add-statement';
        answersDiv.appendChild(newStatementText);

        let checkText2 = document.createElement('p');
        checkText2.textContent = 'For each statement check TRUE (T) or FALSE (F)'
        checkText2.className = 'text-check-tf';
        answersDiv.appendChild(checkText2);


        let tfdiv = document.createElement('div');
        tfdiv.className='T-F-letters1';
        answersDiv.appendChild(tfdiv);
        let pt = document.createElement('p');
        pt.textContent='T';
        let pf = document.createElement('p');
        pf.textContent='F';
        tfdiv.appendChild(pt);
        tfdiv.appendChild(pf);


        addStatement(i, answersDiv);
       /* i++;
        addStatement(i, answersDiv);*/

        newStatementBtn.addEventListener('click',function(){
            whichQuestion(newStatementBtn);
            i++;
            addStatement(i, answersDiv);
        });
    }

}

function addOption(i, answersDiv){

    let optionDiv; 
    let check;
    let answerText;
    let removeOptionBtn;

    optionDiv=document.createElement('div');

    answersDiv.appendChild(optionDiv);
    optionDiv.className='answer-option';

    check= document.createElement('input');
    check.type='checkbox';
    check.name='answercheck'+currentQuestion; //da zna iz kog pitanja
    check.value=1;
    check.className='check-correct1';
    check.id='answercheck'+i;
    optionDiv.appendChild(check);
    // hidden mi treba da dam serveru 0 kad nije checkiran checkbox
        let hidden = document.createElement('input');
        hidden.name='answercheck'+currentQuestion;
        hidden.type='hidden';
        hidden.value=0;
        optionDiv.appendChild(hidden);


    answerText = document.createElement('textarea');
    optionDiv.appendChild(answerText);
    answerText.placeholder='Enter option/answer';
    answerText.className='textarea1';
    answerText.required=true;
    answerText.id='answer-text'+i;
    answerText.name='answer_text_Q'+currentQuestion;

    removeOptionBtn = document.createElement('button');
    optionDiv.appendChild(removeOptionBtn);
    removeOptionBtn.textContent='-';
    removeOptionBtn.className='button4';
    removeOptionBtn.type='button';

    removeOptionBtn.addEventListener('click', function(){
        removeOption(optionDiv, answersDiv);
    });

    if(i==1){//u slucaju da se nikad ne cekira nista
        let checkName = check.name;
        oneChecked(checkName);
    }
    //makar jedan checkbox mora biti cekiran
    check.addEventListener('change', function(){
        let checkName = check.name;
        oneChecked(checkName);
    });//proverava svaki put kad nesto izmenimo da li je makar jedna cekirana

    //console.log(document.querySelector('#question'+currentQuestion).querySelectorAll('.answer-option').length);
}

function oneChecked(name){
    let checkboxes = document.querySelectorAll('input[name='+ CSS.escape(name) +'][type="checkbox"]');
    let hiddens = document.querySelectorAll('input[name='+ CSS.escape(name) +'][type="hidden"]');
    console.log(checkboxes);
    console.log(hiddens);
    let ok=false;
    for(let j=0 ; j<checkboxes.length ; j++){
        if(checkboxes[j].checked){
            ok=true;
            hiddens[j].disabled=true;//kad postujem na server hidden mi treba samo za unchecked checkboxes
        }
        else{
            hiddens[j].disabled=false;
        }
    }
    const errorMessage = !ok ? 'At least one answer must be checked per question' : '';
    checkboxes[0].setCustomValidity(errorMessage);
}

function checkchange(id){
    let checkbox = document.querySelector('input[id='+ CSS.escape(id) +'][type="checkbox"]');
    let hidden = document.querySelector('input[id='+ CSS.escape(id) +'][type="hidden"]');
    console.log(checkbox);
    console.log(hidden);
    if(checkbox.checked){
        hidden.disabled=true;
    }
    else{
        hidden.disabled=false;
    }
}


function addStatement(i, answersDiv){ //slicno kao addOption

    let statementDiv; 
    let checks = [];
    let statementText;

    statementDiv=document.createElement('div');

    answersDiv.appendChild(statementDiv);
    statementDiv.className='answer-option';

    let j=0;
    while(j<2){
        checks[j]= document.createElement('input');
        checks[j].type='radio';
        checks[j].name='check_tf'+currentQuestion + '_' + i; //mora da razlikuje ako ima vise tf pitanja u testu
        checks[j].className='check-correct1';
        checks[j].required=true;
        statementDiv.appendChild(checks[j]);
        j++;
    }
    checks[0].id='check-true'+i;
    checks[1].id='check-false'+i;
    checks[0].value='true';
    checks[1].value='false';


    statementText = document.createElement('textarea');
    statementDiv.appendChild(statementText);
    statementText.placeholder='Enter statement';
    statementText.className='textarea1';
    statementText.required=true;
    statementText.id='statement-text'+i;
    statementText.name='statement_text_Q'+currentQuestion;

    removeStatementBtn = document.createElement('button');
    statementDiv.appendChild(removeStatementBtn);
    removeStatementBtn.textContent='-';
    removeStatementBtn.className='button4';
    removeStatementBtn.type='button';

    removeStatementBtn.addEventListener('click', function(){
        removeStatement(statementDiv, answersDiv);
    });
}


function addQuestion(){
    questionsCount++;
    currentQuestion=questionsCount;


    let newQuestion = document.createElement('div');
    newQuestion.className = 'question';
    newQuestion.id='question'+questionsCount;

    let form = document.querySelector('.questions-form');
    form.insertBefore(newQuestion, form.querySelector('.questions-add'));

    let newLabel = document.createElement('label');
    newLabel.className='question-label';
    newLabel.id='question-label'+questionsCount;
    newLabel.htmlFor='question-text';
    newLabel.textContent='Question '+questionsCount+':';

    let newTextarea = document.createElement('textarea');
    newTextarea.className='question-text';
    newTextarea.id='question-text'+questionsCount;
    newTextarea.placeholder='Question text';
    newTextarea.name='question_text';
    newTextarea.required=true;

    newQuestion.appendChild(newLabel);
    newQuestion.appendChild(newTextarea);


    let newDiv = document.createElement('div');
    newDiv.className='question-types';
    newQuestion.appendChild(newDiv);

    let newLabel2 = document.createElement('label');
    newLabel2.textContent='Question type:';
    newLabel2.htmlFor='type-of-question';
    newDiv.appendChild(newLabel2);

    let newSelect = document.createElement('select');
    newSelect.className='question-type-select';
    newSelect.id='question-type-select'+questionsCount;
    newSelect.name='type_of_question';
    
    let newOptions = [];
    newOptions[0]=document.createElement('option');
    newOptions[0].value='choose-answer';
    newOptions[0].selected=true;
    newOptions[0].textContent='Choose correct answer';
    newOptions[1]=document.createElement('option');
    newOptions[1].value='type-answer';
    newOptions[1].textContent='Type correct answer';
    /*newOptions[2]=document.createElement('option');
    newOptions[2].value='match-two';
    newOptions[2].textContent='Match two tables';*/
    newOptions[2]=document.createElement('option');
    newOptions[2].value='true-false';
    newOptions[2].textContent='True or false';

    for(let i=0 ; i<3 ; i++){
        newSelect.appendChild(newOptions[i]);
    }

    newDiv.appendChild(newSelect);


    firstQType=true;        //inic za nova pitanja
    QuestionTypeChange();
    firstQType=false;

    let copyQuestionsCount = questionsCount;
   // console.log(copyQuestionsCount);

    document.querySelector('#question-type-select'+CSS.escape(questionsCount)).addEventListener('change',function(){
        whichQuestion(document.querySelector('#question-type-select'+CSS.escape(copyQuestionsCount)));
        QuestionTypeChange();
    });
}

function addQuestion2(){//dodavanje vec postojecih pitanja
    document.querySelector('.existing-questions').style.display="block";

    let buttons = document.querySelectorAll('.view-existing-question-btn');
    for(let i=0 ; i<buttons.length ; i++){
        buttons[i].addEventListener('click', function(){
            viewExistingQuestion(i, buttons[i]);//za odredjeno pitanje da se vidi
        });
    }
}

function addedQuestions(checkbox){
    //console.log(checkbox.value);
    if(checkbox.checked){//znaci da je sad cekirana
        questionsCount++;
        let newDiv = document.createElement('div');
        newDiv.className='added-question';
        newDiv.id='qID-'+checkbox.value; //mzd je glupo al zasad nek stoji ovako; potrebno da posle brisem kad odcekiram
        let div = document.querySelector('.added-questions');
        div.style.display='flex';
        div.appendChild(newDiv);
        let p = document.createElement('p');
        let string = 'Q'+ questionsCount +':'+checkbox.dataset.text;
        p.textContent=string;
        newDiv.appendChild(p);
    }
    else{//sad je odcekirana
        let div = document.querySelector('.added-questions');
        let questions = document.querySelectorAll('.question');
        let questions2 = document.querySelectorAll('.added-question');
        if(questions.length === 0 && questions2.length === 1){
            //console.log('zabrana');
            alert('You cannot remove this question because it is the only one');
            checkbox.checked=true;
        }
        else{
            let oldDiv = div.querySelector('#qID-'+CSS.escape(checkbox.value));
            oldDiv.remove();
        }
    }
}

function viewExistingQuestion(i, button){
    let divs = document.querySelectorAll('.existing-question');

    if(button.dataset.view == 'false'){
        divs[i].style.display="block";
        button.dataset.view = 'true';
        button.textContent = 'Minimize';
    }
    else{
        divs[i].style.display="none";
        button.dataset.view = 'false';
        button.textContent = 'View';
    }
}


function removeQuestion(question){
    let questions = document.querySelectorAll('.question'); //nova pitanja
    let questions2 = document.querySelectorAll('.added-question'); //stara pitanja u ovom testu
    let ok=false; //true/false mozemo brisati samo ako vec postoji neko pitanje u testu
    if(questions.length>1){
        ok=true;
    }
    else if(questions2.length>0){
        ok=true;
    }
    if(ok){
        r=confirm('Are you sure you want to delete this question');
        if(r){
            question.remove();
        }
        else{
            console.log(question);
        }
    }
    else{
        alert('You cannot remove this question because it is the only one');
    }
}


function removeOption(option, parent){//choose-answer
    let options = parent.querySelectorAll('.answer-option');
    let ok=false;
    if(options.length>2){
        ok=true;
    }
    if(ok){
        r=confirm('Are you sure you want to delete this option');
        if(r){
            let checkName = option.querySelector('input[type="checkbox"]').name;
            console.log(checkName);
            option.remove();
            oneChecked(checkName);
        }
        else{
            console.log(option);
        }
    }
    else{
        alert('You cannot remove this option');
    }
}

function removeStatement(statement, parent){//true-false , dosta slicno kao prethodno
    let statements = parent.querySelectorAll('.answer-option');
    let ok=false;
    if(statements.length>1){
        ok=true;
    }
    if(ok){
        r=confirm('Are you sure you want to delete this statement');
        if(r){
            statement.remove();
        }
        else{
            console.log(statement);
        }
    }
    else{
        alert('You cannot remove this statement');
    }
}