import * as net from "net";
import * as parser from "./parser/http-parser.js";
import * as balancer from "./balancing/balancer.js";
import * as crypto from "./crypto/signature.js";

balancer.initializeBalancer();

const port = process.env.PORT || 3000;

const server = net.createServer();

server.on("connection", (socket) => {
    let requestBuffer = Buffer.alloc(0);
    socket.on("data", (data) => {
        requestBuffer = Buffer.concat([requestBuffer, data]);
        if (!parser.isMessageValidHTTP(requestBuffer)) { // Close connection if message is not valid HTTP
            socket.write("HTTP/1.1 400 Bad Request\r\n\r\n", () => {
                socket.end();
            });
            return;
        }
        if (parser.isMessageComplete(requestBuffer)) { // Check if the request is complete
            let responseBuffer = Buffer.alloc(0);
            
            // Choose which Cart service to use
            const serviceInfo = balancer.getService(); 
            // Logging chosen service to make sure we are always choosing the correct service
            console.log("Using cart service:", serviceInfo.hostname); 

            const cartService = net.createConnection(serviceInfo.port, serviceInfo.hostname, () => {
                // On cart service connected
                cartService.on("data", (data) => { // Setup response listener from Cart service
                    responseBuffer = Buffer.concat([responseBuffer, data]);
                    if (parser.isMessageComplete(responseBuffer)) { // Check if the response is complete
                        socket.write(responseBuffer, (error) => { // Write the response to client
                            if(error) console.log("Error while writing response:", error.code);
                            cartService.end();
                        });
                    } 
                });
    
                // Inject signature header
                const headers = parser.getHeaders(requestBuffer.toString());
                headers.shift(); // Remove first line (Status line)
                const sig = crypto.signMessage(headers.join("\r\n")); // Sign message
                requestBuffer = parser.addSignatureToRequest(requestBuffer, sig); // Add signature to header
    
                // Write request to Cart service
                cartService.write(requestBuffer, (error) => { 
                    if(error) {
                        console.log("Error while writing request:", error.code);
                        cartService.end();
                        socket.end();
                    }
                    requestBuffer = Buffer.alloc(0); // Reset request buffer
                });
            });

            cartService.on("error", error => {
                console.log("Error on the cart service connection.", error.code);
                cartService.end();
                socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n", () => {
                    socket.end();
                });
            });
        }
    });
    socket.on("error", error => {
        console.log("Error on client connection.", error.code);
    });
});

server.listen(port);