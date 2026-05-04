document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById("save-settings-btn");
    const avatarCircle = document.getElementById("avatar-circle");
    const avatarInput = document.getElementById("avatar-input");


    if (saveBtn) {
        console.log("Save button found, attaching click event...");
    } else {
        console.error("Critical Error: Save button NOT found in DOM!");
    }

    const loadSettings = async () => {
        const data = await window.apiST.getSetting();
        if (data) {
            document.getElementById("display-name").value = data.displayName || "";
            document.getElementById("email").value = data.email || "";
            document.getElementById("phone").value = data.phone || "";
            document.getElementById("notifToggle").checked = (data.notifications === 1);
            if (data.pfp) {
                avatarCircle.style.backgroundImage = `url('${data.pfp}')`;
                const defaultIcon = avatarCircle.querySelector(".Default-avatar");
                if (defaultIcon) defaultIcon.remove();
            }
        }
    };
    loadSettings();


    saveBtn.onclick = async function() {

        const displayName = document.getElementById("display-name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const notifications = document.getElementById("notifToggle").checked ? 1 : 0;

        try {
            saveBtn.innerText = "SAVING...";
            saveBtn.disabled = true;

            const success = await window.apiST.updateSetting(displayName, email, phone, notifications);
            
            if (success) {
                alert("Settings saved successfully!");
                console.log("Save successful");
            } else {
                alert("Save failed.");
            }
        } catch (error) {
            console.error("IPC Error:", error);
            alert("Error communicating with main process.");
        } finally {
            saveBtn.innerText = "SAVE SETTINGS";
            saveBtn.disabled = false;
        }
    };


    avatarCircle.onclick = () => avatarInput.click();
    avatarInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            avatarCircle.style.backgroundImage = `url('${reader.result}')`;
            await window.apiST.updateAvatar(reader.result);
        };
        reader.readAsDataURL(file);
    };
});
