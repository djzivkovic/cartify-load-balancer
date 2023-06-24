export function getHeaders(request) { // Return header array
    const requestParts = request.split("\r\n\r\n"); // Split request into headers and body
    const headers = requestParts[0];
    return headers.split("\r\n");
}

export function getContentLength(headerArray) {
    let requestContentLength = 0;
    for(let i = 1;i<headerArray.length;i++) {
        let headerParts = headerArray[i].split(":");
        if(headerParts.length != 2) continue;
        let headerName = headerParts[0];
        let headerValue = headerParts[1].trimStart();
        if(headerName.toLowerCase() == "content-length") {
            requestContentLength = parseInt(headerValue);
        }
    }
    return requestContentLength;
}

export function isMessageComplete(data) { // Returns true if HTTP message is complete
    const endOfHeaders = data.indexOf("\r\n\r\n");
    if(endOfHeaders < 0) return false;
    const requestContentLength = getContentLength(getHeaders(data.toString()));
    return requestContentLength == 0 || data.byteLength - endOfHeaders - 4 == requestContentLength; // Subtract 4 for \r\n\r\n
}

export function addSignatureToRequest(request, signature) {
    const splitIndex = request.indexOf("\r\n\r\n");
    const headerArray = getHeaders(request.toString());
    const requestContentLength = getContentLength(headerArray);
    headerArray.push("X-Signature: " + signature);
    let returnBytes = Buffer.from(headerArray.join("\r\n") + "\r\n\r\n"); // Reconstruct buffer from header strings
    if(requestContentLength > 0) { // Add body if present
        const body = request.slice(splitIndex + 4);
        returnBytes = Buffer.concat([returnBytes, Buffer.from(body)]);
    }
    return returnBytes;
}

export function isMessageValidHTTP(data) {
    const stringData = data.toString();
    const firstLineEnd = stringData.indexOf("\r\n");
    if (firstLineEnd !== -1) {
        const firstLine = stringData.slice(0, firstLineEnd);
        if (firstLine.startsWith("CONNECT ") ||
            firstLine.startsWith("GET ") ||
            firstLine.startsWith("POST ") ||
            firstLine.startsWith("DELETE ") ||
            firstLine.startsWith("PUT ") ||
            firstLine.startsWith("PATCH ") ||
            firstLine.startsWith("HEAD ") ||
            firstLine.startsWith("OPTIONS ") ||
            firstLine.startsWith("TRACE ")
        ) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}