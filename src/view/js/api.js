const ip = IPADDRESS;

async function send() {
    let query = document.getElementById('query').value;
    let model = document.getElementById('model').value;
    if (query.trim().length < 1) return;
    document.getElementById('query').value = "";
    addMessageUser(query);
    resetTextArea();
    spamResetTextArea();
    try {
        resetTextArea();
        await fetch(`http://${ip}/api/post?model=${model}&query=${query}`);
    } catch (error) {
        console.error(error.message);
    }
}

async function clear() {
    const response = await fetch(`http://${ip}/api/clear?index=0`).then(res => res.text())
    .then(data => console.log(data))
    .catch(err => console.error("Fetch failed:", err));
    // Hardclear checks if the clear button has been pressed twice.
    if(!hardClear()){
        prependChatDivider();
    }
}

async function refreshMessage() {
    const model = document.getElementById('model').value;
    try {
        const response = await fetch(`http://${ip}/api/refresh?model=${model}`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        addMessageBot(json.message.content);
    } catch (error) {
        console.error(error);
    }
}

async function prevMessage() {
    const response = await fetch(`http://${ip}/api/backwards`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const message = await response.text();
    removeLastMessage();
    addMessageBot(message);
}

async function forwardMessage() {
    const response = await fetch(`http://${ip}/api/forward`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const message = await response.text();
    removeLastMessage();
    addMessageBot(message);
}

function debugProcess() {
    fetch(`http://${ip}/api/debug`)
      .then(res => res.text())
      .then(data => console.log("Debug response:", data))
      .catch(err => console.error("Fetch failed:", err));
  }
  

async function retrieveConversation(){
    const response = await fetch(`http://${ip}/api/conversation`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const conversation = await response.json();
    return conversation;
};


async function setUserApi(name){
    try {
        const response = await fetch(`http://${ip}/api/set/user?newName=${name}`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
    } catch (error) {
        console.error(error);
    }
}

async function setAssistantApi(name){
    try {
        const response = await fetch(`http://${ip}/api/set/assistant?newName=${name}`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
    } catch (error) {
        console.error(error);
    }
}
async function getNamesApi(){
    const response = await fetch(`http://${ip}/api/get/names`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const names = await response.json();
    return names;

}