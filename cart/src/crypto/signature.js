import { secp256k1 } from "@noble/curves/secp256k1";
import * as utils from "@noble/curves/abstract/utils";

const pub = process.env.LB_PUBLIC_KEY;

export function verify(msg, sig) {
    return secp256k1.verify(utils.hexToBytes(sig), utils.utf8ToBytes(msg), pub) === true;
}