function resetTextArea() {
    document.getElementById('textAreaWrapper').style.height = "56px";
    document.getElementById('query').value = "";
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-form');
    dropdown.classList.toggle("hidden");
}

function handleKeydown(event) {
    if (!event.shiftKey && event.key === 'Enter') send();
}

function handleKeyup(event) {
    if (!event.shiftKey && event.key === 'Enter') resetTextArea();
}

document.addEventListener("DOMContentLoaded", showModels);
async function showModels() {
    try {
        const response = await fetch(`http://${ip}/api/models`);
        const models = await response.json();
        document.getElementById('model').innerHTML = models.models.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    } catch (error) {
        console.log(error);
    }
}
