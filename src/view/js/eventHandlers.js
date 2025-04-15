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
function adjustHeight() {
    const textarea = document.getElementById('query');
    const textAreaWrapper = document.getElementById('textAreaWrapper');

    if (textarea.value.length === 0) {
        textAreaWrapper.style.height = "56px";
    } else {
    this.style.height = 'auto';
    textAreaWrapper.style.height = textarea.scrollHeight + 'px';
    }
    }