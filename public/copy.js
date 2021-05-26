let button1 = document.querySelector('#copy-btn1');
button1.addEventListener('click',copy);

/*let button2 = document.querySelector('#copy-btn2');
button2.addEventListener('click',copy2);*/

function copy() {//kopira samo code
  let copyText = document.querySelector('#copy-input');

  copyText.select();
  copyText.setSelectionRange(0, 99999); // za mobilne uredjaje

  document.execCommand("copy");
}

/*function copy2() {//TREBA SREDITI pravi link za join
    let copyText = document.querySelector('#copy-input');
    copyText.value = 'http://localhost:3000/groups/join/'+copyText.value+'?_method=PUT'

    copyText.select();
    copyText.setSelectionRange(0, 99999); // za mobilne uredjaje
  
    document.execCommand("copy");
  }*/