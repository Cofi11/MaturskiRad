let joinBtn = document.querySelector('#joingroup');
joinBtn.addEventListener('click', function(){
    let form = document.querySelector('.dropdown-form');
    form.style.display = 'block';
    /*let div = document.querySelector('#dropdown-items-groups');
    div.style.display='block';*/
});


function preSubmit(){
    let form = document.querySelector('.join-group-form');
    let text = form.querySelector('input');
    form.action+=text.value;
    form.action+='?_method=PUT';
}