export const validateUserId = (req, res, next) => {
    const userId = req.params["userId"];
    if (isNaN(userId) || parseInt(userId) < 1) {
        res.status(400);
        return res.json({ message: "Invalid user id." });
    }
    next();
};
  
export const validateProductId = (inBody) => (req, res, next) => {
    const location = inBody ? req.body : req.params;
    const productId = location["productId"];
    if (isNaN(productId) || parseInt(productId) < 1) {
        res.status(400);
        return res.json({ message: "Invalid product id." });
    }
    next();
};
  
export const validateQuantity = (req, res, next) => {
    const quantity = req.body["quantity"];
    if (isNaN(quantity) || parseInt(quantity) < 0) {
        res.status(400);
        return res.json({ message: "Invalid quantity." });
    }
    next();
};
  