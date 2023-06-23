export function getHeaders(request) { // Return header array
    const requestParts = request.split("\r\n\r\n"); // Split request into headers and body
    const headers = requestParts[0];
    return headers.split("\r\n");
}

function getContentLength(headerArray) {
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
    const requestContentLength = getContentLength(getHeaders(data));
    return requestContentLength == 0 || data.length - endOfHeaders - 4 == requestContentLength; // Subtract 4 for \r\n\r\n
}

export function addSignatureToRequest(request, signature) {
    const requestParts = request.split("\r\n\r\n"); // Split request into headers and body
    const headerArray = getHeaders(request);
    const requestContentLength = getContentLength(headerArray);
    headerArray.push("X-Signature: " + signature);
    return headerArray.join("\r\n") + "\r\n\r\n" + (requestContentLength > 0 ? requestParts[1]:"");
}

