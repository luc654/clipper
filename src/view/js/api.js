const ip = IPADDRESS;

async function send() {
    let query = document.getElementById('query').value;
    let model = document.getElementById('model').value;
    if (query.trim().length < 1) return;
    addMessageUser(query);
    resetTextArea();
    try {
        const response = await fetch(`http://${ip}/post?model=${model}&query=${query}`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        addMessageBot(json.message.content);
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
        const response = await fetch(`http://${ip}/refresh?model=${model}`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        addMessageBot(json.message.content);
    } catch (error) {
        console.error(error);
    }
}

async function prevMessage() {
    const response = await fetch(`http://${ip}/prev`);
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