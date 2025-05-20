const profilePic = 'img/profilePic.jpg'
let chatId = 0;

function addMessageUser(text) {
    prependMessage(text, userName, profilePic, 'end');
}

function addMessageBot(text) {
    text = text.replaceAll("\n", "<br>");
    prependMessage(text, charactarName, profilePic, 'start');
}

function removeLastMessage() {
    document.getElementById('chatbox').firstChild.remove();
    chatId--;
}

function prependMessage(text, user, pic, alignment) {
    let wrapper = document.createElement('div');
    wrapper.classList = `flex flex-col w-full items-${alignment}`;

    let userInfo = document.createElement('div');

    if(alignment === "start"){
        // alignment of user info of bot message
        userInfo.classList = 'flex items-center mb-2';
        userInfo.innerHTML = `<img src="${pic}" class="w-10 h-10 rounded-full mr-2 bg-cover" alt=""><p class="text-gray-200 bot-info-name-holder">${user}</p>`;
        
    } else {
        // alignment of user info of user message

        userInfo.classList = 'flex items-center mb-2';
        userInfo.innerHTML = `<p class="mr-2 text-gray-200 user-info-name-holder">${user}</p><img src="${pic}" class="w-10 h-10 rounded-full bg-cover" alt="">`;
    }
    
    let messageDiv = document.createElement('div');
    messageDiv.classList = 'bg-[#2F3335] mt-1 rounded-xl max-w-[65%] w-fit text-gray-200 p-3 py-4';
    messageDiv.id = chatId;
    messageDiv.innerHTML = text;

    wrapper.append(userInfo, messageDiv);
    document.getElementById('chatbox').prepend(wrapper);
    chatId++;
}

function appendMessage(content, id){
    if(!id) {id = chatId - 1};
    document.getElementById(id).innerHTML += content;
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


async function checkForChatImport(){
    // Load safed Conversation
    const safedConv = await retrieveConversation();

    safedConv[0].forEach(element => {
        addMessageUser(element[1]["User"]);
        addMessageBot(element[1]["Assistant"]);
    });

    // Set current modal to previous safed modal
    document.getElementById('model').value = safedConv[1];

    // Load names

    const namesArr = await getNamesApi();
    setName(namesArr["Assistant"], "Assistant");
    setName(namesArr["User"], "User");

    document.getElementById('user-name-input').value = namesArr["User"];
    document.getElementById('bot-name-input').value = namesArr["Assistant"];
}


function nukeChat(){
    document.getElementById("chatbox").innerHTML = "";
    console.log("Chat nuked...");
}



function setName(name, person) {
    userName = name;

    if (person == "Assistant") {
        charactarName = name;
        document.querySelectorAll('.bot-info-name-holder').forEach((elem) => {
            elem.innerHTML = name;
        });
    } else if (person == "User") {
        userName = name;
        document.querySelectorAll('.user-info-name-holder').forEach((elem) => {
            elem.innerHTML = name;
        });
    } else {
        console.error("Unexpected person given to setName, expected 'Assistant' OR 'User'. Got " + person);
    }
}


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