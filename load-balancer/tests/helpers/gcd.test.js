import {describe, it, expect} from "@jest/globals";
import { GCD } from "../../src/helpers/gcd.js";

describe("GCD", () => {
    it("should return the correct GCD for positive numbers", () => {
        expect(GCD([12, 18])).toBe(6);
        expect(GCD([11, 22, 33])).toBe(11);
        expect(GCD([48, 60, 72])).toBe(12);
        expect(GCD([5, 10, 15, 20])).toBe(5);
        expect(GCD([7, 14, 21, 28, 35])).toBe(7);   
    });
  
    it("should return 0 if the input array is empty", () => {
        expect(GCD([])).toBe(NaN);
    });
  
    it("should return the number itself if the input array contains only one number", () => {
        expect(GCD([7])).toBe(7);
    });
  
    it("should return 1 if the GCD of the numbers is 1", () => {
        expect(GCD([13, 14])).toBe(1);
        expect(GCD([1, 2, 3, 4, 5])).toBe(1);
    });
});