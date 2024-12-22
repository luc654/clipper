import ollama from 'ollama'
import { config } from 'dotenv';
import express, { query, response } from 'express';
import fs, { link } from 'fs';
import ip from "ip";


// llama3.1
// llama2-uncensored
let conversation = [];
console.dir ( ip.address() );
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
  console.log(ip.address() +":"+PORT+"/post?model=llama3.1&query=");
});

app.get('/', (req, res) => {
  res.send('Online and listening.');
});
app.get('/post', async (req, res) => {
  console.log("received");
  const { model, query } = req.query;
  if (verify(query)) {
    try {
      const response = await sendQuery(model,query);
      logData(req, response);
      res.send( response);

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


function verify(query) {
  if (query.length < 1) {
    return false;
  } else {
    return true;
  }
}


async function sendQuery(model,query) {
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
  console.log(response.message.content);
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
  if(req.ip.includes(ip.address())){
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