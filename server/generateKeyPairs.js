import { secp256k1 } from '@noble/curves/secp256k1'; 
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex,utf8ToBytes } from "ethereum-cryptography/utils";
const priv = toHex(secp256k1.utils.randomPrivateKey());
const pub = secp256k1.getPublicKey(priv).slice(1);
console.log("Private key :",priv);
console.log("Public Key :",toHex(pub));
console.log("Address :",toHex(keccak256(pub).slice(-20)));