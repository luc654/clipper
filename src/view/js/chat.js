const profilePic = 'img/profilePic.jpg'

function addMessageUser(text) {
    prependMessage(text, 'Testington namus', profilePic, 'end');
}

function addMessageBot(text) {
    text = text.replaceAll("\n", "<br>");
    prependMessage(text, 'Testington namus', profilePic, 'start');
}

function removeLastMessage() {
    document.getElementById('chatbox').firstChild.remove();
}

function prependMessage(text, user, pic, alignment) {
    let wrapper = document.createElement('div');
    wrapper.classList = `flex flex-col w-full items-${alignment}`;

    let userInfo = document.createElement('div');
    userInfo.classList = 'flex items-center';
    userInfo.innerHTML = `<p class="mr-2 text-gray-200">${user}</p><img src="${pic}" class="w-10 h-10 rounded-full bg-cover" alt="">`;
    
    let messageDiv = document.createElement('div');
    messageDiv.classList = 'bg-[#2F3335] mt-1 rounded-xl max-w-[65%] w-fit text-gray-200 p-3 py-4';
    messageDiv.innerHTML = text;

    wrapper.append(userInfo, messageDiv);
    document.getElementById('chatbox').prepend(wrapper);
}
