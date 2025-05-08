import ollama from 'ollama'
import { config } from 'dotenv';
import express, { query, response } from 'express';
import fs, { copyFileSync, link } from 'fs';
import ip from "ip";
import multer from "multer";
import cors from "cors";
import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import { json, text } from 'stream/consumers';
import { normalize } from 'path';

// ==============================================
// Global variables
// ==============================================

// Determines verbose debugging logging
let debug = true;

// Current message index
let index = 0;

// Format {index, ["sender", text],["sender", text]}
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
  
  try {
    await sendMessage(query, model);
    addLevel();
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
    res.sendStatus('500');
  } else {
    res.send(newMessage);
  }
});

app.post('/api/import', upload.single('file'), (req, res) => {
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
  error("Debug");
  warn(conv);
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



async function sendMessage(query, model, miD=null, incrementIndex=true){
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

  
  if(incrementIndex){
    index++
    addToSwipe(index, botMessage);
  }
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
  const botResp = await sendMessage(prevQuery, model, "<Refresh>", false);

  // increase swipe index
  swipeIndex++;

  // store new response
  addToSwipe(index, botResp.content);

}

// ==============================================
// Swipe functions
// ==============================================
function addLevel(){
  swipes.push([index, []]);
}
function addToSwipe(index, text){

  swipes.forEach(element => {

    if(element[0] == index){
      element[1].push(text);
    }
  });

}

function swipeForward(){
  
  let prevBotResp;

  swipeIndex++;

  swipes.forEach(element => {
    
    if(element[0] == index){
      prevBotResp = element[1][swipeIndex];
    }
  });
  if (prevBotResp == undefined || prevBotResp.length < 1){
    warn("Unable to swipe forwards | prevBotResp is empty: " + prevBotResp);
    return "<ERR>";
  }


  conv[conv.length-1]["botResp"] = prevBotResp;
  return prevBotResp;


}
function swipeBackwards(){
  
  let prevBotResp;

  swipeIndex--;

  swipes.forEach(element => {
    
    if(element[0] == index){
      prevBotResp = element[1][swipeIndex];
    }
  });
  if (prevBotResp == undefined || prevBotResp.length < 1){
    warn("Unable to swipe backwards | prevBotResp is empty: " + prevBotResp);
    return "<ERR>";
  }


  conv[conv.length-1]["botResp"] = prevBotResp;
  return prevBotResp;
}

1





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
      swipeIndex = 0;
      swipes = [];
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