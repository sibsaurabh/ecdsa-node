import express ,{json,urlencoded} from 'express';
import cors from 'cors';
import { secp256k1 } from '@noble/curves/secp256k1'; 
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex,utf8ToBytes } from "ethereum-cryptography/utils";
const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());
const usedNonces = new Set();

const balances = {
  "39a7c423dca90c10124bf0c8745f46e5f1447ab9": 100,
  "2dffff96299277c38bed12890faa3a7349581468": 50,
  "6575d5330ca14cbe0f25e2ae7bf3a3a4a82f3865": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, nonce, signature } = req.body;
  
  if(usedNonces.has(nonce)){
    res.status(400).send({ message: "nonce has already been used, replay attack thwarted!" });
  }
  usedNonces.add(nonce);
  let recoveredSignature = JSON.parse(signature);
  let message ={sender : sender, recipient : recipient, amount : amount, nonce : nonce};
  let msgBytes = utf8ToBytes(JSON.stringify(message));
  let msgHash = keccak256(msgBytes);
  recoveredSignature = new secp256k1.Signature(BigInt(recoveredSignature.r) ,BigInt(recoveredSignature.s),parseInt(recoveredSignature.recovery));
  const publicKey = recoveredSignature.recoverPublicKey(msgHash).toRawBytes().slice(1);
  const address = toHex(keccak256(publicKey).slice(-20));

  if(address !==sender){
    res.status(400).send({ message: "Sender is different from the signer!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);
  let sendAmount = parseInt(amount);

  if (balances[sender] < sendAmount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= sendAmount;
    balances[recipient] += sendAmount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
