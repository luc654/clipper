import ollama from 'ollama'
import { config } from 'dotenv';
import express, { query, response } from 'express';
import fs, { link } from 'fs';
import ip from "ip";
import multer from "multer";
import cors from "cors";
import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

// ==============================================
// Global variables
// ==============================================
let debug = true;

let index = 0;
// Format {index, ["sender", text],["sender", text]}
let conv = [];

// Shuts downn server if > maxConnect
const maxConnect = 1;



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
  const response = await (sendMessage(query, model))
  console.log(response);
  res.send(JSON.stringify(response));
} catch (e) {
  error(e);
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



async function sendMessage(query, model){

  const userInp = {role: "user", content: query}
  const history = formatConversation(conv);
  const response = await ollama.chat({
    model: model,
    messages: [
      ...history,
      userInp
    ],

    stream: true
    
  });

  sendToFront("<Start>");
  let botMessage = "";
  for await (const part of response){
    sendToFront(part.message.content);
    botMessage = botMessage.concat(part.message.content);
  }
  sendToFront("<End>");
  const botResp = {role: "assistant", content: botMessage};
  conv.push({index, userInp, botResp});
  index++

  return botResp;
  


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
        formatConv.push({"role": "user", "content": element["userInp"]["content"]});
        formatConv.push({"role": "assistant", "content": element["botResp"]["content"]});
  });

  return formatConv;
}