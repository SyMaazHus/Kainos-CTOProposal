
const newCardBut = document.getElementById('addButton');
const newCard = document.getElementById('newCardForm');
const closeBut = document.getElementById('closeBtn');
const newForm = document.getElementById('newForm');
const submitNew = document.getElementById('submitNew');
const form = document.getElementById('newForm');
const mainWrapper = document.querySelector('.workflow-cards');
const cardWrapper = document.getElementById('workflow-card');
const delBut = document.querySelectorAll('.delete-clicked');
const delBlock = document.getElementById('deleteBlock');
const fillName = document.getElementById('fillTaskName');
const delCancel = document.getElementById('deleteCancel');
const delCon = document.getElementById('deleteConfirm');
let delCard;


const renderWork = async () => {
    const tasks = await window.apiWF.getAllWorkflow();

    tasks.forEach(task =>{
        const newWork = document.createElement('div');
        newWork.className = 'workflow-card status-active';
        const newWrap = document.createElement('div');
        newWrap.className = 'inner-box';
        const newHead = document.createElement('header');
        newHead.className = 'card-header';
        const newTitle = document.createElement('h2');
        newTitle.className = 'card-title';
        newTitle.textContent = task.title;
        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.className = 'delete-clicked';
        newDeleteBtn.textContent = 'X';
        newDeleteBtn.onclick = function(){
            delCard = newDeleteBtn.closest('.workflow-card');
            fillName.innerText = task.title;
            delBlock.style.display = 'block';
        }
        newHead.appendChild(newTitle);
        newHead.appendChild(newDeleteBtn);

        const newTextArea = document.createElement('textarea');
        newTextArea.className = 'card-description-box';
        newTextArea.disabled = true;
        newTextArea.value = task.des;
        const newFooter = document.createElement('footer');
        newFooter.className = 'card-footer';
        const newStatus = document.createElement('span');
        newStatus.className = 'card-status';
        newStatus.textContent = 'Status : Activate'
        const statusBut = document.createElement('button');
        statusBut.className = 'status-color';
        statusBut.id = 'status';

        newFooter.appendChild(newStatus);
        newFooter.appendChild(statusBut);
        newWrap.appendChild(newHead);
        newWrap.appendChild(newTextArea);
        newWrap.appendChild(newFooter);
        newWork.appendChild(newWrap);
        mainWrapper.appendChild(newWork);
    });
}
renderWork();

function closeDelete(box){
    box.style.display = 'none';
}
delCancel.onclick = function(){
    closeDelete(delBlock);
    }
delCon.onclick = function(){
    delCard.remove();
    closeDelete(delBlock);
    }

newCardBut.onclick = function(){
    newCard.style.display = 'block';
}
function close(){
    newCard.style.display = 'none';
    newForm.reset();
}

closeBut.onclick=close;

window.onclick = function(event){
    if(event.target==newCard){
        close();
    }
    if(event.target==delBlock){
        closeDelete(delBlock);
    }
}

delBut.forEach( button =>{
    button.onclick = function(event){  
        delCard = button.closest('.workflow-card');
        const head = button.closest('.card-header');
        const title = head.querySelector('.card-title').innerText;
        fillName.innerText = title ;
        delBlock.style.display = 'block';
    }
});


mainWrapper.addEventListener('click',function(event){
    if (event.target.classList.contains('status-color')){
        const button = event.target;
        const card = button.closest('.workflow-card');
        const text = button.previousElementSibling;
        if(card.classList.contains('status-active')){
            card.classList.replace('status-active','status-inactive');
            text.textContent = 'Status: Inactive';
        }
        else{
            card.classList.replace('status-inactive','status-active');
            text.textContent = 'Status: Active';
        }
        
    }
});

form.addEventListener('submit',function(event){
    event.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const taskJob = document.getElementById('taskDescription').value;
    const newWork = document.createElement('div');
    newWork.className = 'workflow-card status-active';
    const newWrap = document.createElement('div');
    newWrap.className = 'inner-box';
    const newHead = document.createElement('header');
    newHead.className = 'card-header';
    const newTitle = document.createElement('h2');
    newTitle.className = 'card-title';
    newTitle.textContent = taskName;
    const newDeleteBtn = document.createElement('button');
    newDeleteBtn.className = 'delete-clicked';
    newDeleteBtn.textContent = 'X';
    newDeleteBtn.onclick = function(){
        delCard = newDeleteBtn.closest('.workflow-card');
        fillName.innerText = taskName ;
        delBlock.style.display = 'block';
    }
    newHead.appendChild(newTitle);
    newHead.appendChild(newDeleteBtn);

    const newTextArea = document.createElement('textarea');
    newTextArea.className = 'card-description-box';
    newTextArea.disabled = true;
    newTextArea.value = taskJob;
    const newFooter = document.createElement('footer');
    newFooter.className = 'card-footer';
    const newStatus = document.createElement('span');
    newStatus.className = 'card-status';
    newStatus.textContent = 'Status : Activate'
    const statusBut = document.createElement('button');
    statusBut.className = 'status-color';
    statusBut.id = 'status';

    newFooter.appendChild(newStatus);
    newFooter.appendChild(statusBut);
    newWrap.appendChild(newHead);
    newWrap.appendChild(newTextArea);
    newWrap.appendChild(newFooter);
    newWork.appendChild(newWrap);
    mainWrapper.appendChild(newWork);
    close();
});
