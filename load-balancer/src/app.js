import * as net from "net";
import * as parser from "./parser/http-parser.js";
import * as balancer from "./balancing/balancer.js";
import * as crypto from "./crypto/signature.js";

const port = process.env.PORT || 3000;

const server = net.createServer();

server.on("connection", (socket) => {
    let requestString = "";
    socket.on("data", (data) => {
        requestString += data.toString();
        if (parser.isMessageComplete(requestString)) { // Check if the request is complete
            const headers = parser.getHeaders(requestString);
            headers.shift();
            const sig = crypto.signMessage(headers.join("\r\n")); // Sign message
            requestString = parser.addSignatureToRequest(requestString, sig); // Add signature header
            const serviceInfo = balancer.getService(); // Choose which Cart service to use
            console.log("Using cart service:", serviceInfo.hostname);
            const cartService = net.createConnection(serviceInfo.port, serviceInfo.hostname);

            cartService.write(requestString, (err) => { // Write request to Cart service
                if(err) console.log("Error while writing request:", err);
                requestString = "";
            });

            let responseString = "";
            cartService.on("data", (data) => { // Received response from Cart service
                responseString += data.toString();
                if (parser.isMessageComplete(responseString)) { // Check if the response is complete
                    socket.write(responseString, (err) => { // Write the response to client
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