
function updateUsername(){
    const name = document.getElementById('user-name-input').value;
    if(name.length > 0){
        setName(name, "User");
        setUserApi(name);
    } else {
        setName("You", "User");
    }
}


function updateAssistantname(){
    const name = document.getElementById('bot-name-input').value;
    if(name.length > 0){
        setName(name, "Assistant");
        setAssistantApi(name);
    } else {
        setName("Assistant", "Assistant");
    }
}
