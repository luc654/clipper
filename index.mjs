import ollama from 'ollama'
import { config } from 'dotenv';
import express, { query, response } from 'express';
import fs, { link } from 'fs';
import ip from "ip";
import multer from "multer";


let conversation = [];
let prevQuery = "";
let prevModel = "";

let selectedEditIndex = 0;
let currLevelEdits = [];

console.dir(ip.address());
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
  console.log(ip.address() + ":" + PORT + "/post?model=llama3.1&query=");
});

app.get('/', (req, res) => {
  res.send('Clipper: Online and listening.');
});
app.get('/post', async (req, res) => {
  console.log("received");
  const { model, query } = req.query;
 prevModel = model;
 prevQuery = query;
  if (verify(query)) {
    try {
      const response = await sendQuery(model, query);
      logData(req, response);
      res.send(response);

    } catch (error) {
    }
  } else {
    console.log("error");
    res.send(`Invalid data`);
  }
});

app.get('/new', (req, res) => {
  console.log("received clear conversation");
  conversation = [];
  res.send("Chat cleared");
});

app.get('/refresh', async (req, res) => {
  console.log("Refresh message received");
  const response = await refreshMessage();
  res.send(response);
});

app.get('/prev', (req, res) => {
  console.log("prev received");
  const newText = prevResponse();
  console.log(newText);
  res.send(newText);
})

app.get('/forward', (req, res) => {
  console.log("forwarding received");
  const newText = forwardResponse();
  console.log(newText);
  res.send(newText);
})

function verify(query) {
  if (query.length < 1) {
    return false;
  } else {
    return true;
  }
}


async function sendQuery(model, query) {
  const response = await ollama.chat({
    model: model,
    messages: [
      ...conversation,
      { role: 'user', content: query }
    ],
  })
  conversation.push({ role: 'user', content: query });
  conversation.push(response.message);
  console.log(conversation);
  return response;
}


function logData(req, res) {
  const today = Date.now();



  const requestData = `
    Query: ${JSON.stringify(req.query, null, 2)}
    IP: ${req.ip}
    URL: ${req.originalUrl}
    Method: ${req.method}
    Body: ${JSON.stringify(req.body, null, 2)}
    Headers: ${JSON.stringify(req.headers, null, 2)}
    Cookies: ${JSON.stringify(req.cookies, null, 2)}
    Protocol: ${req.protocol}
    Hostname: ${req.hostname}
    Response: ${JSON.stringify(res, null, 5)}
  `;

  let externalCall = "Ext";
  if (req.ip.includes(ip.address())) {
    externalCall = "";
  }

  try {
    fs.appendFile(`logs/${today}${externalCall}.txt`, requestData, function (err) {
      if (err) throw err;
      console.log('Log saved!');
    });
  } catch (err) {
    console.error(err);
  }
}






// File reading / uploading
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read file.' });
    }
    
    
    importConversation(data);
    
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    console.log("Chat imported.");
    res.send("Succes!");
  });
});


function importConversation(data) {

  const newConv = [];
  // Check import type
  if (data.includes("<START>")) {
    const conversationInp = data.split("<START>")[1];
    const messages = conversationInp.split('}}:');


    messages.forEach(chunk => {
      if (chunk.includes('{{user')) {
        
        const message = simulateMessage("assistant", chunk, "{{user");
        newConv.push(message);
      } else {
        const message = simulateMessage("user", chunk, "{{char");
        newConv.push(message);
      }
    });
    conversation = newConv;
  } else {

  }
}



function simulateMessage(role, text, remove) {
  return { role: role, content: text.replace(remove, "")};
}




async function refreshMessage(){

  const prevMessage = conversation[conversation.length - 1];
  currLevelEdits.push(prevMessage);
  
  const newConv = conversation.slice(0, -2);
  conversation = newConv;
  const response = await sendQuery(prevModel, prevQuery);

  selectedEditIndex++;
  return response;

}

function prevResponse(){
  selectedEditIndex--;
  const newText = currLevelEdits[selectedEditIndex];
  if (validateResponse(newText)) setMessage(newText);
  setMessage(newText);
  return newText;
}
function forwardResponse(){
  const newText = currLevelEdits[selectedEditIndex];
  if (validateResponse(newText)) setMessage(newText);
  return newText;
}
function validateResponse(response){
  if(response !== undefined){
    return true
  }
  return false;
}


// Only use to edit bot messages
function setMessage(text){

  const newConv = conversation.slice(0, -1);
  newConv.push(text);
  
}