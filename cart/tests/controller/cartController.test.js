import {jest, describe, beforeAll, afterEach, it, expect} from "@jest/globals";
import { getUserCart, addProduct, removeProduct, updateQuantity } from "../../src/controllers/cartController.js";

describe("Cart Controller", () => {
    let redis;

    beforeAll(() => {
        redis = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserCart", () => {
        it("should return empty object if user cart does not exist", async () => {
            redis.get.mockReturnValue(undefined);

            const userId = "1";
            const result = await getUserCart(redis, userId);

            expect(result).toEqual({});
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.get).toHaveBeenCalledWith(userId);
        });

        it("should return the user cart if it exists", async () => {
            const userCart = { "1": 2, "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));

            const userId = "1";
            const result = await getUserCart(redis, userId);

            expect(result).toEqual(userCart);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.get).toHaveBeenCalledWith(userId);
        });
    });

    describe("addProduct", () => {
        it("should add a product to the user cart", async () => {
            const userCart = { "1": 2 };
            const updatedCart = { "1": 3 };
            redis.get.mockReturnValue(JSON.stringify(userCart));

            redis.set.mockImplementationOnce(null);

            const userId = "1";
            const productId = "1";
            const result = await addProduct(redis, userId, productId);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledWith(userId, JSON.stringify(updatedCart));
        });

        it("should add a new product to an empty user cart", async () => {
            const updatedCart = { "1": 1 };
            redis.get.mockReturnValue(null);
            redis.set.mockImplementationOnce(null);

            const userId = "1";
            const productId = "1";
            const result = await addProduct(redis, userId, productId);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledWith(userId, JSON.stringify(updatedCart));
        });
    });

    describe("removeProduct", () => {
        it("should remove a product from the user cart", async () => {
            const userCart = { "1": 2, "2": 1 };
            const updatedCart = { "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));
            redis.set.mockImplementationOnce(null);
            const userId = "1";
            const productId = "1";
            const result = await removeProduct(redis, userId, productId);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledWith(userId, JSON.stringify(updatedCart));

        });

        it("should delete cart if it's empty after removing a product", async () => {
            const userCart = { "1": 2};
            redis.get.mockReturnValue(JSON.stringify(userCart));
            redis.set.mockImplementationOnce(null);
            redis.del.mockImplementationOnce(null);
            const userId = "1";
            const productId = "1";
            const result = await removeProduct(redis, userId, productId);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).not.toHaveBeenCalled();
            expect(redis.del).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledWith(userId);
        });

        it("should return 0 if the product does not exist in the user cart", async () => {
            const userCart = { "1": 2, "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));

            const userId = "1";
            const productId = "3";
            const result = await removeProduct(redis, userId, productId);

            expect(result).toBe(0);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).not.toHaveBeenCalled();
        });
    });

    describe("updateQuantity", () => {
        it("should update the quantity of a product in the user cart", async () => {
            const userCart = { "1": 2, "2": 1 };
            const updatedCart = { "1": 4, "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));
            redis.set.mockImplementationOnce(null);

            const userId = "1";
            const productId = "1";
            const quantity = 4;
            const result = await updateQuantity(redis, userId, productId, quantity);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledWith(userId, JSON.stringify(updatedCart));
        });

        it("should delete a product from the user cart if the quantity is 0", async () => {
            const userCart = { "1": 2, "2": 1 };
            const updatedCart = { "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));
            redis.set.mockImplementationOnce(null);
            const userId = "1";
            const productId = "1";
            const quantity = 0;
            const result = await updateQuantity(redis, userId, productId, quantity);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledWith(userId, JSON.stringify(updatedCart));
        });

        it("should delete cart when deleting a product from the user cart if the quantity is 0", async () => {
            const userCart = { "1": 2 };
            redis.get.mockReturnValue(JSON.stringify(userCart));
            redis.set.mockImplementationOnce(null);
            redis.del.mockImplementationOnce(null);
            const userId = "1";
            const productId = "1";
            const quantity = 0;
            const result = await updateQuantity(redis, userId, productId, quantity);

            expect(result).toBe(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledTimes(1);
            expect(redis.set).not.toHaveBeenCalled();
            expect(redis.del).toHaveBeenCalledWith(userId);
        });

        it("should return 0 if the product does not exist in the user cart", async () => {
            const userCart = { "1": 2, "2": 1 };
            redis.get.mockReturnValue(JSON.stringify(userCart));

            const userId = "1";
            const productId = "3";
            const quantity = 1;
            const result = await updateQuantity(redis, userId, productId, quantity);

            expect(result).toBe(0);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).not.toHaveBeenCalled();
        });
    });
});
