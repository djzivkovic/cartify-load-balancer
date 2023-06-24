import express from "express";
import * as cart from "../controllers/cartController.js";
import * as crypto from "../crypto/signature.js";
import redis from "../storage/redis.js";
import { validateUserId, validateProductId, validateQuantity } from "../middleware/validationMiddleware.js";
import { verifySignature } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products from user's cart
router.get("/:userId", verifySignature(crypto), validateUserId, async (req, res) => {
    const userId = req.params["userId"];
    const userCart = await cart.getUserCart(redis, userId);
    if(Object.keys(userCart).length == 0) {
        res.status(404);
        return res.json({message: "User cart doesn't exist."});
    }
    return res.json({message: "Sucessfully retrieved cart data.", data: userCart});
});

// Add a product to user's cart
router.post("/:userId/products", verifySignature(crypto), validateUserId, validateProductId(true), async (req, res) => {
    const userId = req.params["userId"];
    const productId = req.body["productId"];

    await cart.addProduct(redis, userId, productId);
    return res.json({message: "Successfully added product."});
});

// Delete a product from user's cart
router.delete("/:userId/products/:productId", verifySignature(crypto), validateUserId, validateProductId(false), async (req, res) => {
    const userId = req.params["userId"];
    const productId = req.params["productId"];

    const result = await cart.removeProduct(redis, userId, productId);
    if(result) {
        return res.json({message: "Successfully deleted product."});
    }
    else {
        return res.json({message: "Product doesn't exist in the cart."});
    }
});

// Update a product's quantity in user's cart
router.patch("/:userId/products/:productId", verifySignature(crypto), validateUserId, 
    validateProductId(false), validateQuantity, async (req, res) => {
        const userId = req.params["userId"];
        const productId = req.params["productId"];
        const quantity = req.body["quantity"];

        const result = cart.updateQuantity(redis, userId, productId, quantity);
        if(result) {
            return res.json({message: "Successfully updated product quantity."});
        }
        else {
            return res.json({message: "Product doesn't exist in the cart."});
        }
    });

export default router;