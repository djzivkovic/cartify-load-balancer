import redis from "../storage/redis.js";

export async function getUserCart(userId) {
    let cart = await redis.get(userId);
    if (!cart) return {};
    return JSON.parse(cart);
}
  
export async function addProduct(userId, productId) {
    const userCart = await getUserCart(userId);
    if (userCart[productId]) userCart[productId]++;
    else {
        userCart[productId] = 1;
    }
    await redis.set(userId, JSON.stringify(userCart));
    return 1;
}
  
export async function removeProduct(userId, productId) {
    const userCart = await getUserCart(userId);
    if (userCart[productId]) delete userCart[productId];
    else {
        return 0;
    }
    await redis.set(userId, JSON.stringify(userCart));
    return 1;
}
  
export async function updateQuantity(userId, productId, quantity) {
    const userCart = await getUserCart(userId);
    if (!userCart[productId]) {
        return 0;
    }
    if (parseInt(quantity) === 0) {
        delete userCart[productId];
    } else {
        userCart[productId] = quantity;
    }
    await redis.set(userId, JSON.stringify(userCart));
    return 1;
}
  