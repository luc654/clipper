document.getElementById('sendQuery').addEventListener('click', send);
document.getElementById('clearChat').addEventListener('click', clear);
document.getElementById('refreshMessage').addEventListener('click', () => {
    removeLastMessage();
    refreshMessage();
});
document.getElementById('prevMessage').addEventListener('click', prevMessage);
document.getElementById("debug").addEventListener('click', debugProcess);
document.getElementById('forwardMessage').addEventListener('click', forwardMessage);

document.getElementById('query').addEventListener('keydown', function (event) {
    if (event.shiftKey && event.key === 'Enter') {
    } else if (event.key === 'Enter') {
        send()
    }
});

document.getElementById('uploadButton').addEventListener('click', uploadFile);
document.getElementById('optionsBtn').addEventListener('click', toggleDropdown);

document.getElementById("query").addEventListener('input', adjustHeight);

document.getElementById("user-name-input").addEventListener('input', updateUsername);
document.getElementById("bot-name-input").addEventListener('input', updateAssistantname);

window.onload = function() {
    document.getElementById('query').value = "";
    checkForChatImport();
};



