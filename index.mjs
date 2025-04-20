import ollama from 'ollama'
import { config } from 'dotenv';
import express, { query, response } from 'express';
import fs, { link } from 'fs';
import ip from "ip";
import multer from "multer";

// ==============================================
// Global variables
// ==============================================
let debug = true;

let index = 0;
// Format {index, ["sender", text],["sender", text]}
let conv = [];



// ==============================================
// Set up Express
// ==============================================

const app = express();
const port = 3000;
const ipAddr = ip.address();



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



// ==============================================
// Ollama Functions
// ==============================================

async function getModals(){
  try {
    const modals = await ollama.list();
    if(modals){
      dbg("Suc");
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
  const response = await ollama.chat({
    model: model,
    messages: {

    }
  });
  



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


}