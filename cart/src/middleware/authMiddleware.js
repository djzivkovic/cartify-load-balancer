import * as crypto from "../crypto/signature.js";

export const verifySignature = (req, res, next) => {
    const headers = req.rawHeaders;
    let msg = "";
    let i = 0;
    for (i; i < (headers.length - 2);i+=2) { // Reconstruct message from raw headers
        msg += headers[i] + ": " + headers[i+1] + "\r\n";
    }
    if(!headers[i] || headers[i] != "X-Signature") {
        res.status(401);
        return res.json({ message: "Unauthorized." });
    }
    const sig = headers[i+1]; // Extract signature from last header
    if (!crypto.verify(msg, sig)) {
        res.status(401);
        return res.json({ message: "Unauthorized." });
    }
    next();
};