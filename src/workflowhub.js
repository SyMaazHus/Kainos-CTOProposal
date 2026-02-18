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
let delId;

const renderWork = async () => {
    mainWrapper.innerHTML = '';
    const tasks = await window.apiWF.getAllWorkflow();
    tasks.forEach(task =>{
        const isActive = task.status;
        const newWork = document.createElement('div');
        newWork.className = isActive ? 'workflow-card status-active': 'workflow-card status-inactive';
        const newWrap = document.createElement('div');
        newWrap.className = 'inner-box';
        const newHead = document.createElement('header');
        newHead.className = 'card-header';
        const newTitle = document.createElement('h2');
        newTitle.className = 'card-title';
        newTitle.textContent = task.title;

        //delete workflow functionality
        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.className = 'delete-clicked';
        newDeleteBtn.textContent = 'X';
        newDeleteBtn.onclick = function(){
            delCard = newDeleteBtn.closest('.workflow-card');
            fillName.innerText = task.title;
            delBlock.style.display = 'block';
            delId = task.jobID;
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
        const currentStatus = isActive ? 'Status : Activate' : 'Status : Inactivate';
        newStatus.textContent = currentStatus;

        //change status functionality
        const statusBut = document.createElement('button');
        statusBut.className = 'status-color';
        statusBut.id = 'status';
        statusBut.onclick = () => changeStatus(task.jobID,isActive);

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

// function changing task status
async function changeStatus(jobID,isActive){
    const newStatus = isActive ? 0 : 1;
    await window.apiWF.switchStatus(jobID,newStatus);
    renderWork();
}
// function close pop up box
function closeDelete(box){
    box.style.display = 'none';
}
// function close pop up delete box
delCancel.onclick = function(){
    closeDelete(delBlock);
    }
//function to remove task
delCon.onclick = async function(){
    await window.apiWF.deleteTask(delId);
    delCard.remove();
    closeDelete(delBlock);
    }

//display pop-up box
newCardBut.onclick = function(){
    newCard.style.display = 'block';
}

//close new workflow form and reset form
function close(){
    newCard.style.display = 'none';
    newForm.reset();
}

closeBut.onclick=close;

//close pop-up box if mouse clicked outside box
window.onclick = function(event){
    if(event.target==newCard){
        close();
    }
    if(event.target==delBlock){
        closeDelete(delBlock);
    }
}

// delBut.forEach( button =>{
//     button.onclick = function(event){  
//         delCard = button.closest('.workflow-card');
//         const head = button.closest('.card-header');
//         const title = head.querySelector('.card-title').innerText;
//         fillName.innerText = title ;
//         delBlock.style.display = 'block';
//     }
// });

//form for recieve new task information
form.addEventListener('submit',async function(event){
    event.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const taskJob = document.getElementById('taskDescription').value;

    await window.apiWF.addTask(taskName,taskJob);

    close();
    renderWork();
});
