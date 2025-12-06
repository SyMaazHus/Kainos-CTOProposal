
const newCardBut = document.getElementById("add-button");
const newCard = document.getElementById("new-card-form");
const closeBut = document.getElementById('close-button');
const newForm = document.getElementById('new-form');
const submitNew = document.getElementById('submit-new');
const form = document.getElementById('new-form');
const mainWrapper = document.querySelector('.workflow-cards');
const cardWrapper = document.getElementById('workflow-card');

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

form.addEventListener('submit',function(event){
    event.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const taskJob = document.getElementById('task-description').value;

    const newWork = document.createElement('div');
    newWork.className = 'workflow-card status-active';

    const newWrap = document.createElement('div');
    newWrap.className = 'inner-box';

    const newHead = document.createElement('header');
    newHead.className = 'card-header';
    const newTitle = document.createElement('h2');
    newTitle.className = 'card-title';
    newTitle.textContent = taskName;

    newHead.appendChild(newTitle)

    const newTextArea = document.createElement('textarea');
    newTextArea.className = 'card-description-box';
    newTextArea.disabled = true;
    newTextArea.value = taskJob;

    const newFooter = document.createElement('footer');
    newFooter.className = 'card-footer';
    const newSetting = document.createElement('button');
    newSetting.className = 'setting';
    
    newSetting.innerHTML =  '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"  fill="none"> <path d="M8.82083 25L8.3375 21C8.07569 20.8958 7.82899 20.7708 7.5974 20.625C7.3658 20.4792 7.13924 20.3229 6.91771 20.1562L3.32292 21.7188L0 15.7812L3.11146 13.3438C3.09132 13.1979 3.08125 13.0573 3.08125 12.9219V12.0781C3.08125 11.9427 3.09132 11.8021 3.11146 11.6562L0 9.21875L3.32292 3.28125L6.91771 4.84375C7.13924 4.67708 7.37083 4.52083 7.6125 4.375C7.85417 4.22917 8.09583 4.10417 8.3375 4L8.82083 0H15.4667L15.95 4C16.2118 4.10417 16.4585 4.22917 16.6901 4.375C16.9217 4.52083 17.1483 4.67708 17.3698 4.84375L20.9646 3.28125L24.2875 9.21875L21.176 11.6562C21.1962 11.8021 21.2063 11.9427 21.2063 12.0781V12.9219C21.2063 13.0573 21.1861 13.1979 21.1458 13.3438L24.2573 15.7812L20.9344 21.7188L17.3698 20.1562C17.1483 20.3229 16.9167 20.4792 16.675 20.625C16.4333 20.7708 16.1917 20.8958 15.95 21L15.4667 25H8.82083ZM10.9354 22.5H13.3219L13.7448 19.1875C14.3691 19.0208 14.9481 18.776 15.4818 18.4531C16.0155 18.1302 16.5038 17.7396 16.9469 17.2812L19.9375 18.5625L21.1156 16.4375L18.5177 14.4063C18.6184 14.1146 18.6889 13.8073 18.7292 13.4844C18.7694 13.1615 18.7896 12.8333 18.7896 12.5C18.7896 12.1667 18.7694 11.8385 18.7292 11.5156C18.6889 11.1927 18.6184 10.8854 18.5177 10.5938L21.1156 8.5625L19.9375 6.4375L16.9469 7.75C16.5038 7.27083 16.0155 6.86979 15.4818 6.54688C14.9481 6.22396 14.3691 5.97917 13.7448 5.8125L13.3521 2.5H10.9656L10.5427 5.8125C9.9184 5.97917 9.33941 6.22396 8.80573 6.54688C8.27205 6.86979 7.78368 7.26042 7.34063 7.71875L4.35 6.4375L3.17188 8.5625L5.76979 10.5625C5.6691 10.875 5.59861 11.1875 5.55833 11.5C5.51806 11.8125 5.49792 12.1458 5.49792 12.5C5.49792 12.8333 5.51806 13.1563 5.55833 13.4688C5.59861 13.7813 5.6691 14.0938 5.76979 14.4063L3.17188 16.4375L4.35 18.5625L7.34063 17.25C7.78368 17.7292 8.27205 18.1302 8.80573 18.4531C9.33941 18.776 9.9184 19.0208 10.5427 19.1875L10.9354 22.5ZM12.2042 16.875C13.3722 16.875 14.3691 16.4479 15.1948 15.5938C16.0205 14.7396 16.4333 13.7083 16.4333 12.5C16.4333 11.2917 16.0205 10.2604 15.1948 9.40625C14.3691 8.55208 13.3722 8.125 12.2042 8.125C11.016 8.125 10.0141 8.55208 9.19844 9.40625C8.38281 10.2604 7.975 11.2917 7.975 12.5C7.975 13.7083 8.38281 14.7396 9.19844 15.5938C10.0141 16.4479 11.016 16.875 12.2042 16.875Z" fill="#1D1B20"/></svg>';
    const newStatus = document.createElement('span');
    newStatus.className = 'card-status';
    newStatus.textContent = 'Status : Activate'
    const statusBut = document.createElement('button');
    statusBut.className = 'status-color';
    statusBut.id = 'status';

    newFooter.appendChild(newSetting);
    newFooter.appendChild(newStatus);
    newFooter.appendChild(statusBut);

    newWrap.appendChild(newHead);
    newWrap.appendChild(newTextArea);
    newWrap.appendChild(newFooter);

    newWork.appendChild(newWrap);

    mainWrapper.appendChild(newWork)
    close();
});
