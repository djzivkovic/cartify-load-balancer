# Cartify Load Balancer

This project implements a load balancer for a cart service. The load balancer distributes incoming requests among multiple instances of the cart service using the Weighted Round Robin algorithm.

The project consists of two main components: the cart service and the load balancer.

## Cart Service

The cart service handles requests related to managing user shopping carts.

#### API endpoints

`GET /carts/<userId>`: Retrieves all products from the user's cart.
   
`POST /carts/<userId>/products`: Adds a product to the user's cart. Body parameter: `productId`.

`DELETE /carts/<userId>/products/<productId>`: Deletes a product from the user's cart.
   
`PATCH /carts/<userId>/products/<productId>`: Updates the quantity of a product in the user's cart. Body parameter: `quantity`.

#### Structure
The relevant files for the cart service are located in the `cart/src` directory:

- `app.js`: Sets up the Express.js server and defines the routes for the cart service.
- `routes/cartRoutes.js`: Defines the route handlers for the cart service's API endpoints.
- `controllers/cartController.js`: Manages operations on user shopping carts.
- `middleware/validationMiddleware.js`: Contains middleware functions for validating request parameters.
- `middleware/authMiddleware.js`: Implements middleware for verifying request signatures.
- `storage/redis.js`: Configures and exports a Redis client for storing cart data.
- `crypto/signature.js`: Provides functions for verifying signatures.

## Load Balancer

The load balancer is responsible for distributing incoming requests among multiple instances of the cart service. It uses the Weighted Round Robin algorithm to select a cart service instance based on the assigned weights.

#### Structure
The relevant files for the load balancer are located in the `load-balancer/src` directory:

- `app.js`: Sets up a TCP server to receive requests and forwards them to the appropriate cart service instance.
- `balancing/balancer.js`: Implements the logic for selecting a cart service instance using the Weighted Round Robin algorithm.
- `parser/http-parser.js`: Implements functions to parse HTTP requests and responses.
- `helpers/gcd.js`: Defines a helper function to calculate the greatest common divisor (GCD) of multiple numbers.
- `crypto/signature.js`: Provides functions for signing messages using a private key.

## Getting Started

To run the project using Docker, follow these steps:

### 1. Setting up the necessary variables in `docker-compose.yml`:

#### For each cart service, you need to set:
 - `PORT`: Service port.
 - `REDIS_HOST`: Redis hostname.
 - `REDIS_PORT`: Redis port.
 - `LB_PUBLIC_KEY`: Load balancer public key used to verify incoming requests.

#### For the load balancer, you need to set:
 - `PORT`: Load balancer port.
 - `SERVICES`: A comma-separated list of cart service instances with their host, port, and weight (e.g. `SERVICES=host1:port1:weight1,host2:port2:weight2`).
 - `PRIVATE_KEY`: Private key used for signing requests.

You also need to set the exposed ports in all the docker containers by changing their `ports` configuration.
### 2. Running the containers:

  ```bash
  docker compose build
  docker compose up
  ```
  You can also use:
  ```bash
  docker compose up --build
  ```

### 3. Running the tests:
  The tests are separate for each service:
  ```
  cd cart
  npm test
  ```
  
  ```
  cd load-balancer
  npm test
  ```
