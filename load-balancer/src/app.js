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
        if (parser.isMessageComplete(requestBuffer)) { // Check if the request is complete

            const headers = parser.getHeaders(requestBuffer.toString());
            headers.shift(); // Remove first line (Status line)
            const sig = crypto.signMessage(headers.join("\r\n")); // Sign message
            requestBuffer = parser.addSignatureToRequest(requestBuffer, sig); // Add signature header

            const serviceInfo = balancer.getService(); // Choose which Cart service to use
            console.log("Using cart service:", serviceInfo.hostname);
            const cartService = net.createConnection(serviceInfo.port, serviceInfo.hostname);

            cartService.write(requestBuffer, (err) => { // Write request to Cart service
                if(err) console.log("Error while writing request:", err);
                requestBuffer = Buffer.alloc(0);
            });

            let responseBuffer = Buffer.alloc(0);
            cartService.on("data", (data) => { // Received response from Cart service
                responseBuffer = Buffer.concat([responseBuffer, data]);
                if (parser.isMessageComplete(responseBuffer)) { // Check if the response is complete
                    socket.write(responseBuffer, (err) => { // Write the response to client
                        if(err) console.log("Error while writing response:", err);
                        cartService.end();
                    });
                } 
            });

            cartService.on("end", hadError => {
                if(hadError)
                    console.log("Error when closing the cart service connection.");
            });
        }
    });
    socket.on("end", hadError => {
        if(hadError)
            console.log("Error when closing the connection.");
    });
});

server.listen(port);