// Author: Basil Biji Chirathilattu 
var replyContainer = document.getElementById("replyContainer");
var chatInput = document.getElementById("chatInput");
var replyContainer = document.getElementById("replyContainer");
let currentHeight = chatInput.scrollHeight;

const sendBtn = document.getElementById("sendBtn");
const introBlock = document.getElementById("introBlock");
const chatHistory = document.getElementById("chatHistory");
const chatContainer = document.getElementById("chatContainer");

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

sendBtn.addEventListener("click", send);

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Stop new line
        send();
    }
}); //logic for shift+enter making a new line. 

function send(){
    const text = chatInput.value.trim();

    if(!text){
        return 
    }

    chatContainer.classList.add("active");
    //this handles the introblock hiding and the chathistory now appearing

    addChatBubble(text,'user');
    // reset height 
    chatInput.value = "";
    chatInput.style.height = "auto"
    const loadingBubble = waitForMessage(); 

    setTimeout(() => {
        if(loadingBubble)loadingBubble.remove(); // removes the bubble 
        // this needs to be replaced with the AI logic.
        const botReplies = [
            "That doesn't sound that productive",
            "Well Done!",
            "For. sure.",
            "Would you like to search for that?"
        ];
        const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
        
        addChatBubble(randomReply, 'bot');
    }, 1500); 


    //function to add the message onto screen 

    function addChatBubble(text,sender){
        const div = document.createElement("div"); //creates html div, to then add the bubbles onto screen 
        div.classList.add("message", sender);
        div.innerText = text;

        chatHistory.appendChild(div);

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    


}

function waitForMessage(){
    const div = document.createElement("div");

    div.classList.add("message","bot");
    //creates the three dots 
    div.innerHTML = `
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;

    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight; //ensures that the scrollHeight is maintained 

    return div; 
}

 

