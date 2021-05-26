const deleteButton = document.querySelectorAll('.delete-button');

let string; //tests ili questions
if(document.location.href.includes('/tests')){
    string='tests';
}
else if(document.location.href.includes('/questions')){
    string='questions';
}

for(let i=0 ; i<deleteButton.length ; i++){
    deleteButton[i].addEventListener('click', async function(){
        const endpoint = `/${string}/${deleteButton[i].dataset.id}`;
        string = string.slice(0, string.length-1);
        r=confirm('Are you sure? This ' + string + ' will permanently be deleted from the database');
        if(r){
            try{
                const response = await fetch(endpoint,{
                    method: 'DELETE'
                });
                const data = await response.json();
                //console.log(data);
                if(data.error != null)alert(data.error);
                document.location=data.redirect;
            }
            catch(err){
                console.log(err);
            }
        }
    });
}