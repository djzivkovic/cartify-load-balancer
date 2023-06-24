import {describe, it, beforeEach, expect} from "@jest/globals";
import {getService, initializeBalancer} from "../../src/balancing/balancer.js";

describe("Balancer", () => {
    beforeEach(() => {
        process.env.SERVICES = "hostname1:port1:4,hostname2:port2:6,hostname3:port3:8";
        initializeBalancer();
    });
  
    it("should return the services based on the Weighted Round Robin algorithm", () => {    
        let service;
        for(let i = 0;i < 5;i++) { // Test 5 cycles
            service = getService();
            expect(service).toEqual({ hostname: "hostname1", port: "port1", weight: 2 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname1", port: "port1", weight: 2 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname2", port: "port2", weight: 3 });
            
            service = getService();
            expect(service).toEqual({ hostname: "hostname2", port: "port2", weight: 3 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname2", port: "port2", weight: 3 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname3", port: "port3", weight: 4 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname3", port: "port3", weight: 4 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname3", port: "port3", weight: 4 });
    
            service = getService();
            expect(service).toEqual({ hostname: "hostname3", port: "port3", weight: 4 });
        } 
    });
});