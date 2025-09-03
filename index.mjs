import ollama from 'ollama'
import express, { query, response } from 'express';
import fs, { copyFileSync, link } from 'fs';
import ip from "ip";
import multer from "multer";
import cors from "cors";
import { WebSocketServer } from 'ws';

// ==============================================
// Global variables
// ==============================================

// Determines verbose debugging logging
let debug = true;

// Current message index
let index = 0;

// Format {index, ["User", text],["Assistant", text]}
let conv = [];

// Shuts down server if > maxConnect
const maxConnect = 1;

// Format {[Level index, ["text", "text"]]}
let swipes = []
// Index of current swipe in the swipe nested array.
let swipeIndex = 0;

// Previous query
let prevQuery = "";

// Previous modal 
let prevModal = "";

// Name of User
let userName = "You";

// Name of Assistant;
let assistantName = "Assistant";



// Used for chat import
const upload = multer({ dest: 'uploads/'});


// ==============================================
// Set up Express
// ==============================================

const app = express();
const port = 3000;
const ipAddr = ip.address();
app.use(cors());


app.listen(port, () => {
  console.log(`Server active on ${ipAddr}:${port}`);

});

// ==============================================
// Express Endpoints
// ==============================================
app.get('/api/modals', async (req, res) => {
  const modals = await getModals();
  res.send(modals);
});

app.get('/api/post', async (req, res) => {
  const  { model, query} = req.query;
  console.log(`Received: ${model} -> ${query.substr(0, 40)}`);
  clearSwipes();
  try {
    await sendMessage(query, model);
    resetSwipes();
  prevQuery = query;
} catch (e) {
  error(e);
}
});

app.get('/api/refresh', async (req, res) => {
  const {model} = req.query;
  dbg("Received refresh");
  try {
    refresh(model);
    res.send("Refresh done");
  } catch (e) {
    error(e);
    res.send(e);
  }
})

app.get('/api/backwards', async (req, res) => {
  const newMessage = swipeBackwards();
  if (newMessage == "<ERR>"){
    res.status(705).send("<Stop>");
  } else {
    res.send(newMessage);
  }
});

app.get('/api/forward', async (req, res) => {
  const newMessage = swipeForward();
  if (newMessage == "<ERR>"){
    res.status(705).send("<Stop>");

  } else {
    res.send(newMessage);
  }
});

app.post('/api/import', upload.single('file'), (req, res) => {
  dbg("Attempting to import chat");
  
  const filePath = req.file.path;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err){
      error(err);
      return res.status(500).json({ error: 'Failed to read file.'});
    }
    
    importChat(data);
    res.status(200).json({ message: 'Chat imported!'});
  });
})

app.get('/api/debug', (req, res) => {
  console.log("Debugging:");
  error(swipeIndex);
  warn(swipes);
  warn(conv);
  warn(swipeIndex);
  warn(index);
  res.send("Debug log complete");

});

app.get('/api/set/user', (req, res) => {
  const {newName} = req.query;
  userName = newName;
  res.send(`Set Users name to ${newName}`);
  dbg(`Set Users name to ${newName}`);
});

app.get('/api/set/assistant', (req, res) => {
  const {newName} = req.query;
  assistantName = newName;
  res.send(`Set Assistant name to ${newName}`);
  dbg(`Set Assistant name to ${newName}`);
});

app.get('/api/get/names', (req, res) => {
  res.json({
    Assistant: assistantName,
    User: userName
  })
});



app.get('/api/conversation', async (req, res) => {
  if(conv.length > 0 ){
    console.log("Uploading current conversation...");
  }
  res.send([conv, prevModal]);
});

app.get('/api/clear', async (req, res) => {
  const {index} = req.query;

  const ccStatus = clearChat(index);

  if(ccStatus){
    console.log("Chat cleared successfully");
    res.status(200).json({message: 'Chat cleared!'});
  } else {
    console.log("Error clearing chat.");
    res.status(404).json({message: `Failed to clear chat? index: ${index}`});
  }
});

app.get('api/change', async (req, res) => {
  const {phrase, correction} = req.query;
  if(verify(phrase) && verify(correction)){
    if (change(phrase, correction)){
    res.status(200).json({ message: 'Change successfull'});
    } else {
    res.status(404).json({ message: 'Error while attempting to change text.'});
    }
  }
})

// ==============================================
// WebSockets
// ==============================================

const wss = new WebSocketServer({host: ipAddr, port: 8080})

const clients = new Set();

wss.on('connection', (ws) => {
    console.log("Client connected");
    clients.add(ws);

    if(clients.size > maxConnect){

      error(`More than ${maxConnect} people connnected, shutting down!`);

      for (const client of clients){
        if(client.readyState === client.OPEN){
          
          client.send("<NUKE>");
        }
      }

      
      emergencyShutdown();
      wss.close();
    }

    ws.on('close', () => {
      console.log("Client left");
      clients.delete(ws);
    })
    
    ws.on('error', (err) => {
      console.log("Client crashed: " , err);
      clients.delete(ws);
    })
})

function sendToFront(content){
  for (const client of clients){
    if(client.readyState === client.OPEN){
      client.send(content);
    }
  }
}

// ==============================================
// Ollama Functions
// ==============================================

async function getModals(){
  try {
    const modals = await ollama.list();
    if(modals){
      return modals;
    } else {
      warn("Could not retrieve modals");
      return "";
    }
  } catch (e) {
  error("Ollama service not detected. Try running `ollama serve`");
  }
}



async function sendMessage(query, model, miD=null){

  const userInp = {role: "user", content: query}
  prevModal = model;

  const history = formatConversation(conv);
  const response = await ollama.chat({
    model: model,
    messages: [
      ...history,
      userInp
    ],

    stream: true
    
  });

  if(!miD){

    sendToFront("<Start>");
  } else {
    sendToFront(miD);
  }
  let botMessage = "";
  for await (const part of response){
    sendToFront(part.message.content);
    botMessage = botMessage.concat(part.message.content);
  }
  sendToFront("<End>");

  const mess = [
    index,
    {
      "User": query,
      "Assistant": botMessage
    }
  ];

  conv.push(mess);

  
  addToSwipe(botMessage);
  return botMessage;
  


}








// ==============================================
// Util functions
// ==============================================

async function warn(text){
  const format = ["", "", text,"",""];
  format.forEach((elem) => {
    console.log(elem);
  });
}
async function error(text){
  const format = ["", "===========", text,"===========",""];
  format.forEach((elem) => {
    console.log(elem);
  });
}
async function dbg(text){
  if(debug){
    console.log(text);
  }
}


async function verify(text){
  if(text.length > 0){
    return true;
  }
  error("Verification failed, text does not exist.")
  return false;
}


// ==============================================
// Format functions
// ==============================================

function formatConversation(oldConv){

  let formatConv = [];
  oldConv.forEach(element => {
    // Each element holds both the user and assistant message in either another nested array.
        formatConv.push({"role": "user", "content": element[1]["User"]});
        formatConv.push({"role": "assistant", "content": element[1]["Assistant"]});
  });

  return formatConv;
}

// 
// Refresh functions
// 


async function refresh(model){

  // Remove the last entry of current conversation
  conv.pop();

  // generate new response
  const botResp = await sendMessage(prevQuery, model, "<Refresh>");

  // increase swipe index
  swipeIndex++;
}

// ==============================================
// Swipe functions
// ==============================================


// Swiping forward should increase swipe index and return the message at that index
function swipeForward(){
  if(swipeIndex === swipes.length - 1){
    warn("Attempted swipe out of range");
    return "<ERR>";
  }
  swipeIndex++;
  
  conv[conv.length - 1][1]["Assistant"] = swipes[swipeIndex];
  return swipes[swipeIndex];
}

// Swiping backwards should decrease swipe index and return the message at that index
function swipeBackwards(){
  if(swipeIndex === 0){
    warn("Attempted swipe out of range");
    return "<ERR>";
  }
  swipeIndex--;

  conv[conv.length - 1][1]["Assistant"] = swipes[swipeIndex];
  return swipes[swipeIndex];
}

// Add to swipe 
function addToSwipe(message){
  swipes.push(message); 
}

function clearSwipes(){
  swipes = [];
}


// Clear the swipeIndex
function resetSwipes(){
  swipeIndex = 0;
}


// ==============================================
// Chat import
// ==============================================


function importChat(inputStr) {  
  const lines = inputStr.split(/\r?\n/).filter(Boolean); 

  
  let input = lines.map(line => JSON.parse(line));

  const charName = input[0].character_name;
  if(charName.length > 0){
    assistantName = charName;
  };
  const convStart = input[1].name;

  console.log(`Character: ${charName}`);
  let is ;
  let ot ;
  if(convStart === charName){
    is = charName;
    ot = "You";
  } else {
    is = "You";
    ot = charName;
  }



  let formattedConv = [];
  const keys = Object.keys(input); 
  
  let ii = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const elem = input[key];
    
    if (elem.name === is) {
    if(ot === "You"){
      if (ii === 0) {
        const mess = [
          ii,
          {
            "User": `Start chat. You are ${charName}`,
            "Assistant": elem.mes
          }
        ];
        formattedConv.push(mess);
        ii++;
      } else {
        const mess = [
          ii,
          {
            "User": input[i - 1]?.mes ?? "",
            "Assistant": elem.mes
          }
        ];
        formattedConv.push(mess);
        ii++;
      }
      
    }
    }

  }
  console.log("Chat importing success");
  conv = formattedConv;
}



// ==============================================
// Clear chat function
// ==============================================


function clearChat(removeAmount){


  if(removeAmount > index){
    return false;
  }

  try {
    if(removeAmount == 0){
      conv = [];
      resetSwipes();
      clearSwipes();
    } else {
      conv = conv.slice(index - removeAmount);
      swipeIndex = swipeIndex - removeAmount;
      swipes = swipes.slice(index - removeAmount);
    }
  } catch (error) {
    return false;
  }
  return true;

}



// ==============================================
// Shutdown Utils
// ==============================================

function emergencyShutdown(){
  process.exit(1);
}


// ==============================================
// Rename things function
// ==============================================

function change(phrase, correction){
  const oldConv = conv;
  try {
    conv.forEach((elem) => {
      elem["User"].replaceAll(phrase, correction);
      elem["Assistant"].replaceAll(phrase, correction);
  
    });
  } catch (error) {
    conv = oldConv;
    error(`Error while changing phrase. ${error}`);
    return false;
  }
  return true;
}
