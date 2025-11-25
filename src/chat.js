var replyContainer = document.getElementById("replyContainer");
var chatInput = document.getElementById("chatInput");
var replyContainer = document.getElementById("replyContainer");
let currentHeight = chatInput.scrollHeight;

replyContainer.addEventListener("click", function (e) {

    chatInput.focus(); 

    //basically just ensures that the chat input is highlighted when the box is clicked 
});

chatInput.addEventListener("input",function(){
    this.style.transition = 'none';
    this.style.height = 'auto';
    let newHeight = this.scrollHeight;

    if(newHeight > currentHeight){
        this.style.height = (this.scrollHeight) + 'px';
        void this.offsetHeight;
        this.style.transition = 'height 0.15s ease-out';
        this.style.height = newHeight + 'px';
    }
    else{
        this.style.height = newHeight + 'px';
    }

    currentHeight = newHeight;




    if (this.scrollHeight > 200) { 
      this.style.overflowY = "scroll";
  } else {
      this.style.overflowY = "hidden";
  }
})


 

