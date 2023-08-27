import { secp256k1 } from '@noble/curves/secp256k1'; 
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex,utf8ToBytes } from "ethereum-cryptography/utils";
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function promptInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {

  const sender = await promptInput('Enter the sender address: ');
  const recipient = await promptInput('Enter the recipient address: ');
  const amount = await promptInput('Enter amount to be send: ');
  const PRIVATE_KEY = await promptInput('Enter your PRIVATE_KEY: ');
  const nonce = uuidv4();

  let message ={sender : sender, recipient : recipient, amount : amount, nonce : nonce};
  let msgBytes = utf8ToBytes(JSON.stringify(message));
  let msgHash = keccak256(msgBytes);
  let sig = secp256k1.sign(msgHash, PRIVATE_KEY); 
  
  const signatureString = JSON.stringify({
      r: sig.r.toString(),
      s: sig.s.toString(),
      recovery: sig.recovery
    });
  
  console.log(nonce);
  console.log(signatureString);
  rl.close();
}

main();