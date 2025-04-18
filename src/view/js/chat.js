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

    if(alignment === "start"){
        // alignment of user info of bot message
        userInfo.classList = 'flex items-center mb-2';
        userInfo.innerHTML = `<img src="${pic}" class="w-10 h-10 rounded-full mr-2 bg-cover" alt=""><p class="text-gray-200">${user}</p>`;
        
    } else {
        // alignment of user info of user message

        userInfo.classList = 'flex items-center mb-2';
        userInfo.innerHTML = `<p class="mr-2 text-gray-200">${user}</p><img src="${pic}" class="w-10 h-10 rounded-full bg-cover" alt="">`;
    }
    
    let messageDiv = document.createElement('div');
    messageDiv.classList = 'bg-[#2F3335] mt-1 rounded-xl max-w-[65%] w-fit text-gray-200 p-3 py-4';
    messageDiv.innerHTML = text;

    wrapper.append(userInfo, messageDiv);
    document.getElementById('chatbox').prepend(wrapper);
}


function prependChatDivider(){
    const linebreak = document.createElement('div');
            linebreak.classList = 'w-full rounded-full  bg-[#2F3335] px-4 py-2 mt-12 mb-4';

            document.getElementById('chatbox').prepend(linebreak);
};

function styleInp(e){
    const textarea = document.getElementById('query');
    const textAreaWrapper = document.getElementById('textAreaWrapper');
   
    textarea.style.height = 'auto';
    textAreaWrapper.style.height = this.scrollHeight + 'px';
    if (textarea.value.length == 0) {
        textAreaWrapper.style.height = "56px";
    }
}