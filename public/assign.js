let groupBtn = document.querySelector('#group-btn');
let linkBtn = document.querySelector('#link-btn');
let clicked = false; //mora bar jedno dugme da bude kliknuto, ili link ili group assign
groupBtn.addEventListener('click', function(){
    clicked=true;
    groupBtn.style.backgroundColor="rgb(134, 165, 255)";
    groupBtn.style.opacity="1";
    linkBtn.style.backgroundColor="rgb(179, 198, 255)";
    linkBtn.style.opacity="0.5";
    let groupDiv = document.querySelector('.assign-group');
    groupDiv.style.display='flex';
    let linkDiv = document.querySelector('.assign-link');
    linkDiv.style.display='none';
    let radios = document.querySelectorAll('input[type=radio]');
    for(let i=0 ; i<radios.length ; i++){
        radios[i].required=true;
    }
    let divs = linkDiv.querySelectorAll('.whitelist-email');
    let input = divs[0].querySelector('input[type=email]');
    let checkbox = linkDiv.querySelector('input[type=checkbox]');
    checkbox.checked=false;
    input.value="";
    input.required=false;
    divs[0].style.display='none';
    for(let i=1 ; i<divs.length ; i++){
        divs[i].remove();
    }
});

let membersBtn = document.querySelectorAll('.members-button');
let membersDiv = document.querySelectorAll('.members2');
for(let i=0 ; i<membersBtn.length ; i++){
    membersBtn[i].addEventListener('click', function(){
        if(membersBtn[i].dataset.sh==1){
            membersDiv[i].style.display='flex';
            membersBtn[i].dataset.sh=0;
            membersBtn[i].textContent='Hide Members';
        }
        else{
            membersDiv[i].style.display='none';
            membersBtn[i].dataset.sh=1;
            membersBtn[i].textContent='Show Members';
        }
    })
}

linkBtn.addEventListener('click', function(){
    clicked=true;
    linkBtn.style.backgroundColor="rgb(134, 165, 255)";
    linkBtn.style.opacity="1";
    groupBtn.style.backgroundColor="rgb(179, 198, 255)";
    groupBtn.style.opacity="0.5";
    let linkDiv = document.querySelector('.assign-link');
    linkDiv.style.display='flex';
    let groupDiv = document.querySelector('.assign-group');
    groupDiv.style.display='none';
    let radios = document.querySelectorAll('input[type=radio]');
    for(let i=0 ; i<radios.length ; i++){
        radios[i].required=false;
        radios[i].checked=false;
    }
    let checkbox = linkDiv.querySelector('input[type=checkbox]');
    checkbox.addEventListener('change', function(){
        let divs = document.querySelectorAll('.whitelist-email');
        let inputs = document.querySelectorAll('input[type=email]');
        let div2 = document.querySelector('.add-email');
        if(checkbox.checked){
            div2.style.display='inline-block';
            for(let i=0 ; i<divs.length ; i++){
                divs[i].style.display='flex';
                inputs[i].required=true;
                inputs[i].disabled=false;
            }
        }
        else{
            div2.style.display='none';
            for(let i=0 ; i<divs.length ; i++){
                divs[i].style.display='none';
                inputs[i].required=false;
                inputs[i].disabled=true;
            }
        }
    })
});

let addEmailBtn = document.querySelector('#addEmail');
addEmailBtn.addEventListener('click', function(){
    addEmail();
    numerize();
});

function addEmail(){
    let div = document.querySelector('.assign-link');
    let div2 = document.querySelector('.add-email');
    let emailDiv = document.createElement('div');
    emailDiv.className='whitelist-email';
    emailDiv.style.display='flex';
    div.insertBefore(emailDiv, div2);

    let label = document.createElement('label');
    label.textContent='Email';
    label.className='label-email';
    let input = document.createElement('input');
    input.type='email';
    input.name='emails';
    input.id='email';
    input.required=true;
    emailDiv.appendChild(label);
    emailDiv.appendChild(input);

    let deleteBtn = document.createElement('button');
    emailDiv.appendChild(deleteBtn);
    deleteBtn.textContent='Remove';
    deleteBtn.className='delete-button';
    deleteBtn.type='button';

    deleteBtn.addEventListener('click', function(){
        emailDiv.remove();
        numerize();
    })
}

function numerize(){//kad se nesto izbrise il doda prodje kroz sve ispocetka i numerise
    let div = document.querySelector('.assign-link');
    let inputs=div.querySelectorAll('input[type=email]');
    let labels=div.querySelectorAll('.label-email');
    for(let i=1 ; i<inputs.length ; i++){
        labels[i].textContent='Email '+(i+1)+':';
        inputs[i].id='email'+(i+1);
    }
}


/*za date and time ogranicenja*/ 
let today = new Date();
let day = today.getDate();
if(day<10){
    day='0'+day;
}
let month = today.getMonth()+1;
if(month<10){
    month='0'+month;
}
let year = today.getFullYear();
let hour = today.getHours();
let minutes = today.getMinutes();
minutes+=2;
minutes=minutes%60;
if(hour<10){
    hour='0'+hour;
}
if(minutes<10){
    minutes='0'+minutes;
}



let dateStart = document.querySelector('#date_start');
let dateEnd = document.querySelector('#date_end');
let timeStart = document.querySelector('#time_start');
let timeEnd = document.querySelector('#time_end');

dateStart.min=year+'-'+month+'-'+day;
dateEnd.min=year+'-'+month+'-'+day;
let dsValue;
let deValue;
timeStart.min=hour+':'+minutes;
timeEnd.min=hour+':'+minutes;
dateStart.addEventListener('change', function(){
    dsValue=dateStart.value;
    if(dsValue == dateStart.min){
        timeStart.min=hour+':'+minutes;
        timeEnd.min=hour+':'+minutes;
    }
    else{
        timeStart.min='nebitno';//cim nije pravi format nema min
        timeEnd.min='nebitno';
    }
    if(dsValue.value!=''){
        dateEnd.min=dsValue;
    }
})
dateEnd.addEventListener('change', function(){
    deValue=dateEnd.value;
})

timeStart.addEventListener('change', function(){
    if(timeStart.value!='' && dsValue==deValue){
        //console.log(timeStart.value);
        timeEnd.min=timeStart.value;
    }
})


//ako nije kliknuto ni group ni link assign dugme
function preSubmit(){
    if(!clicked){
        alert('You did not choose assigning option');
        return false;
    }
    return true;
}
