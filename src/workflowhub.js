
const newCardBut = document.getElementById("add-button");
const newCard = document.getElementById("new-card-wrapper");
const closeBut = document.getElementById('close-button');
const newForm = document.getElementById('new-form');

newCardBut.onclick = function(){
    newCard.style.display = "block";
}

function close(){
    newCard.style.display = "none";
    newForm.reset();
}
closeBut.onclick=close;

window.onclick = function(event){
    if(event.target==newCard){
        close();
    }
}

