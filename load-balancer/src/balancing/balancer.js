import * as gcd from "../helpers/gcd.js";

let services;
let currentIndex = 0;
let totalWeight = 0;

export function initializeBalancer() { // Create service objects from ENV
    services = process.env.SERVICES.split(",").reduce((result, url) => {
        const [hostname, port, weight] = url.split(":");
        result.push({ hostname, port, weight: parseInt(weight) });
        return result;
    }, []);

    // Find GCD of weights
    const weights = [];
    for (const service of services) {
        weights.push(service.weight);
    }
    const weightsGCD = gcd.GCD(weights);

    // Calculate weights ratio and find total 
    for (const service of services) {
        service.weight /= weightsGCD;
        totalWeight += service.weight;
    }
}

// Function to get the service based on Weighted Round Robin algorithm
export function getService() {
    let selectedServiceIndex;

    let currentWeight = currentIndex;
    for (let i = 0; i < services.length; i++) {
        currentWeight -= services[i].weight;
        if (currentWeight < 0) {
            selectedServiceIndex = i;
            break;
        }
    }
    currentIndex = (currentIndex + 1) % totalWeight;
    return services[selectedServiceIndex];
}