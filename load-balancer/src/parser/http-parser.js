export function isMessageComplete(data) { // Returns true if HTTP message is complete
    let requestContentLength = 0;
    const requestParts = data.indexOf("\r\n\r\n"); // Split request into headers and body
    let parts = data.split(requestParts);
    let headers = parts[0];
    let headerArray = headers.split("\r\n");
    for(let i = 1;i<headerArray.length;i++) {
        let headerParts = headerArray[i].split(":");
        if(headerParts.length != 2) continue;
        let headerName = headerParts[0];
        let headerValue = headerParts[1].trimStart();
        if(headerName.toLowerCase() == "content-length") {
            requestContentLength = parseInt(headerValue);
        }
    }
    return data.includes("\r\n\r\n") && requestContentLength == 0 || 
    data.length - requestParts - 4 == requestContentLength; // Subtract 4 for \r\n\r\n
}