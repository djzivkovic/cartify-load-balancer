import {jest, describe, beforeEach, it, expect} from "@jest/globals";
import { validateUserId, validateProductId, validateQuantity } from "../../src/middleware/validationMiddleware.js";

describe("Input Validation Middleware", () => {
    describe("validateUserId", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                params: { userId: "123" },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        it("should call next if the userId is valid", () => {
            validateUserId(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("should return a 400 error if the userId is not an integer", () => {
            req.params.userId = "abc";

            validateUserId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid user id." });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return a 400 error if the userId is a negative integer", () => {
            req.params.userId = "-123";

            validateUserId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid user id." });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("validateProductId", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                body: { productId: "456" },
                params: { productId: "789" },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        it("should call next if the productId is valid in the body", () => {
            const middleware = validateProductId(true);

            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("should call next if the productId is valid in the params", () => {
            const middleware = validateProductId(false);

            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("should return a 400 error if the productId in the body is not a positive integer", () => {
            req.body.productId = "abc";
            const middleware = validateProductId(true);

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid product id." });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return a 400 error if the productId in the params is not a positive integer", () => {
            req.params.productId = "abc";
            const middleware = validateProductId(false);

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid product id." });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("validateQuantity", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                body: { quantity: "3" },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        it("should call next if the quantity is a valid positive integer", () => {
            validateQuantity(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("should call next if the quantity is 0", () => {
            req.body.quantity = "0";

            validateQuantity(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("should return a 400 error if the quantity is not a positive integer", () => {
            req.body.quantity = "abc";

            validateQuantity(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid quantity." });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return a 400 error if the quantity is a negative integer", () => {
            req.body.quantity = "-5";

            validateQuantity(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid quantity." });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
