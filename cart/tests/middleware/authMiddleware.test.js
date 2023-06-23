import {jest, describe, it, expect} from "@jest/globals";
import { verifySignature } from "../../src/middleware/authMiddleware.js";

const req = {
    rawHeaders: [
        "Host",
        "localhost",
        "Content-Type",
        "application/json",
        "X-Signature",
        "signature",
    ],
};
  
const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
};

const crypto = {
    verify: jest.fn(),
};

describe("verifySignature", () => {
    it("should call next() if the signature is valid", () => {
        crypto.verify.mockReturnValue(true);

        const next = jest.fn();
  
        verifySignature(crypto)(req, res, next);
  
        expect(next).toHaveBeenCalled();
    });
  
    it("should return 401 if the signature is missing", () => {
        req.rawHeaders = ["Host", "localhost", "Content-Type", "application/json"];
  
        res.status.mockClear();
        res.json.mockClear();
        const next = jest.fn();

        verifySignature(crypto)(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized." });
    });
  
    it("should return 401 if the signature is invalid", () => {
        crypto.verify.mockReturnValue(false);

        res.status.mockClear();
        res.json.mockClear();
        const next = jest.fn();

        verifySignature(crypto)(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized." });
    });
});