
const newCardBut = document.getElementById("add-button");
const newCard = document.getElementById("new-card-wrapper");
const closeBut = document.getElementById('close-button');
const newForm = document.getElementById('new-form');
const submitNew = document.getElementById('submit-new');


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
const mainWrapper = document.querySelector('.workflow-cards');
const cardWrapper = document.getElementById('workflow-card');
mainWrapper.addEventListener('click',function(event){
    if (event.target.classList.contains('status-color')){
        const button = event.target;
        const card = button.closest('.workflow-card');
        const text = button.previousElementSibling;
        if(card.classList.contains('status-active')){
            card.classList.replace('status-active','status-inactive');
            text.textContent = "Status: Inactive";
        }
        else{
            card.classList.replace('status-inactive','status-active');
            text.textContent = "Status: Active";
        }
        
    }
});
