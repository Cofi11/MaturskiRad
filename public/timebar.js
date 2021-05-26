let hidden1 = document.querySelector('#startsAt');
let hidden2 = document.querySelector('#endsAt');

let start = new Date(hidden1.value);

if(hidden2.value){
    let today = new Date();
    let end = new Date(hidden2.value);
    //console.log(start);
    //console.log(end);
    let duration = (end.getTime() - start.getTime())/1000;
    let timeLeft = (end.getTime() - today.getTime())/1000;
    let timePassed = duration-timeLeft;

    timePassed = '-'+timePassed+'s';

    duration = duration+"s";
    /*console.log(duration);
    console.log(timeLeft);
    console.log(timePassed);*/

    let startDay = start.getDate();
    if(startDay<10){
        startDay='0'+startDay;
    }
    let startMonth = start.getMonth();
    if(startMonth<10){
        startMonth='0'+startMonth;
    } 
    let startYear = start.getFullYear();
    let startHour = start.getHours();
    if(startHour<10){
        startHour='0'+startHour;
    }
    let startMinutes = start.getMinutes();
    if(startMinutes<10){
        startMinutes='0'+startMinutes;
    }
    let startSeconds = start.getSeconds();
    if(startSeconds<10){
        startSeconds='0'+startSeconds;
    }

    let start2 = startDay+'.'+startMonth+'.'+startYear+'. '+startHour+':'+startMinutes+':'+startSeconds;
    //console.log(start2);

    let endDay = end.getDate();
    if(endDay<10){
        endDay='0'+endDay;
    }
    let endMonth = end.getMonth();
    if(endMonth<10){
        endMonth='0'+endMonth;
    } 
    let endYear = end.getFullYear();
    let endHour = end.getHours();
    if(endHour<10){
        endHour='0'+endHour;
    }
    let endMinutes = end.getMinutes();
    if(endMinutes<10){
        endMinutes='0'+endMinutes;
    }
    let endSeconds = end.getSeconds();
    if(endSeconds<10){
        endSeconds='0'+endSeconds;
    }

    let end2 = endDay+'.'+endMonth+'.'+endYear+'. '+endHour+':'+endMinutes+':'+endSeconds;
    //console.log(end2);

    let startDiv = document.querySelector('.timer-start');
    startDiv.textContent=start2;
    let endDiv = document.querySelector('.timer-end');
    endDiv.textContent=end2;

    timer(duration, timePassed);
}
else{
    console.log('nema kraja');
}

async function timer(duration, delay){ //jos srediti ovo
    let progress = document.querySelector('.progress');
    progress.style.animationDuration = duration;
    progress.style.animationPlayState = 'running';
    progress.style.animationDelay = delay;
}