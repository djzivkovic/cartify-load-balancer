export async function getUserCart(storage, userId) {
    let cart = await storage.get(userId);
    if (!cart) return {};
    return JSON.parse(cart);
}
  
export async function addProduct(storage, userId, productId) {
    const userCart = await getUserCart(storage, userId);
    if (userCart[productId]) userCart[productId]++;
    else {
        userCart[productId] = 1;
    }
    await storage.set(userId, JSON.stringify(userCart));
    return 1;
}
  
export async function removeProduct(storage, userId, productId) {
    const userCart = await getUserCart(storage, userId);
    if (userCart[productId]) delete userCart[productId];
    else {
        return 0;
    }
    if (Object.keys(userCart).length == 0) {
        await storage.del(userId);
    }
    else {
        await storage.set(userId, JSON.stringify(userCart));
    }
    return 1;
}
  
export async function updateQuantity(storage, userId, productId, quantity) {
    const userCart = await getUserCart(storage, userId);
    if (!userCart[productId]) {
        return 0;
    }
    if (parseInt(quantity) === 0) {
        delete userCart[productId];
        if (Object.keys(userCart).length == 0) {
            await storage.del(userId);
            return 1;
        }
    } else {
        userCart[productId] = quantity;
    }
    await storage.set(userId, JSON.stringify(userCart));
    return 1;
}
  