import { secp256k1 } from "@noble/curves/secp256k1";
import * as utils from "@noble/curves/abstract/utils";

const priv = process.env.PRIVATE_KEY;

export function signMessage(msg) {
    return secp256k1.sign(utils.utf8ToBytes(msg), priv).toCompactHex();
}