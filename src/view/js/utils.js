function resetTextArea() {
    document.getElementById('textAreaWrapper').style.height = "56px";
    const textarea = document.getElementById('query');
    textarea.value = '';                
    textarea.textContent = '';          
    textarea.innerText = '';            
    textarea.innerHTML = '';            
    textarea.setAttribute('value', ''); 
    textAreaWrapper.style.height = "56px";
}
function spamResetTextArea(duration = 500, interval = 5) {
    const start = performance.now();
    const id = setInterval(() => {
        resetTextArea();
        if (performance.now() - start > duration) {
            clearInterval(id);
        }
    }, interval);
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-form');
    dropdown.classList.toggle("hidden");
}

function handleKeydown(event) {
    if (!event.shiftKey && event.key === 'Enter') {
        event.preventDefault(); 
        send();
    }
}


function handleKeyup(event) {
    if (!event.shiftKey && event.key === 'Enter') resetTextArea();
}

document.addEventListener("DOMContentLoaded", showModels);
async function showModels() {
    try {
        const response = await fetch(`http://${ip}/api/modals`);
        const models = await response.json();
        document.getElementById('model').innerHTML = models.models.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    } catch (error) {
        console.log(error);
    }
}
