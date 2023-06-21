import express from "express";
import * as cart from "../controllers/cartController.js";
import * as validator from "../middleware/validationMiddleware.js";

const router = express.Router();
// Get all products from user's cart
router.get("/:userId", validator.validateUserId, async (req, res) => {
    const userId = req.params["userId"];
    const userCart = await cart.getUserCart(userId);
    return res.json({data: userCart});
});

// Add a product to user's cart
router.post("/:userId", validator.validateUserId, validator.validateProductId(true), async (req, res) => {
    const userId = req.params["userId"];
    const productId = req.body["productId"];

    await cart.addProduct(userId, productId);
    return res.json({message: "Successfully added product."});
});

// Delete a product from user's cart
router.delete("/:userId/product/:productId", validator.validateUserId, 
    validator.validateProductId(false), async (req, res) => {
        const userId = req.params["userId"];
        const productId = req.params["productId"];

        const result = await cart.removeProduct(userId, productId);
        if(result) {
            return res.json({message: "Successfully deleted product."});
        }
        else {
            return res.json({message: "Product doesn't exist in the cart."});
        }
    });

// Update a product's quantity in user's cart
router.patch("/:userId/product/:productId", validator.validateUserId, 
    validator.validateProductId(false), validator.validateQuantity, async (req, res) => {
        const userId = req.params["userId"];
        const productId = req.params["productId"];
        const quantity = req.body["quantity"];

        const result = cart.updateQuantity(userId, productId, quantity);
        if(result) {
            return res.json({message: "Successfully updated product quantity."});
        }
        else {
            return res.json({message: "Product doesn't exist in the cart."});
        }
    });

export default router;