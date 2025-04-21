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
    const response = await fetch(`http://${ip}/new`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    console.log("Chat cleared successfully");
    prependChatDivider();
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
    const response = await fetch(`http://${ip}/forward`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const message = await response.text();
    removeLastMessage();
    addMessageBot(message);
}

function debugProcess() {
    const response = fetch(`http://${ip}/debug`, {});
}