import * as net from "net";
import * as parser from "./parser/http-parser.js";

const port = process.env.PORT || 3000;
const serviceUrls = process.env.SERVICE_URLS.split(",").reduce((result, url) => {
    const [hostname, port] = url.split(":");
    result.push({ hostname, port });
    return result;
}, []);
const serviceWeights = process.env.INITIAL_WEIGHTS.split(",").map(Number);
let serviceIndex = 0;

const server = net.createServer();

server.on("connection", (socket) => {
    let requestString = "";
    socket.on("data", (data) => {
        requestString += data.toString();
        if (parser.isMessageComplete(requestString)) { // Check if the request is complete
            // Choose which Cart service to use
            const currentService = serviceUrls[serviceIndex++];
            serviceIndex %= serviceUrls.length;
            const cartService = net.createConnection(currentService.port, currentService.hostname);

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