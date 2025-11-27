document.addEventListener("DOMContentLoaded", function () {

  const avatarCircle = document.getElementById("avatar-circle");
  const avatarInput = document.getElementById("avatar-input");

  
  avatarCircle.onclick = () => {
    avatarInput.click();
  };

  
  avatarInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    
    avatarCircle.style.backgroundImage = `url('${url}')`;

   
    const inner = avatarCircle.querySelector(".Default-avatar");
    if (inner) inner.remove();
  };
});