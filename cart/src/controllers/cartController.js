export async function getUserCart(storage, userId) {
    let cart = await storage.redis.get(userId);
    if (!cart) return {};
    return JSON.parse(cart);
}
  
export async function addProduct(storage, userId, productId) {
    let lock;
    try {
        lock = await storage.redlock.acquire([`lock_${userId}`], 5000);
        const userCart = await getUserCart(storage, userId);
        if (userCart[productId]) userCart[productId]++;
        else {
            userCart[productId] = 1;
        }
        await storage.redis.set(userId, JSON.stringify(userCart));
    }
    catch(error) {
        console.log("Error while locking.", error);
    }
    if(lock)
        lock.release();
    return 1;
}
  
export async function removeProduct(storage, userId, productId) {
    let lock;
    try {
        lock = await storage.redlock.acquire([`lock_${userId}`], 5000);
        const userCart = await getUserCart(storage, userId);
        if (userCart[productId]) delete userCart[productId];
        else {
            if(lock)
                lock.release();
            return 0;
        }
        if (Object.keys(userCart).length == 0) {
            await storage.redis.del(userId);
        }
        else {
            await storage.redis.set(userId, JSON.stringify(userCart));
        }
    }   
    catch(error) {
        console.log("Error while locking.", error);
    }
    if(lock)
        lock.release();
    return 1;
}
  
export async function updateQuantity(storage, userId, productId, quantity) {
    let lock;
    try {
        lock = await storage.redlock.acquire([`lock_${userId}`], 5000);
        const userCart = await getUserCart(storage, userId);
        if (!userCart[productId]) {
            if(lock)
                lock.release();
            return 0;
        }
        if (parseInt(quantity) === 0) {
            delete userCart[productId];
            if (Object.keys(userCart).length == 0) {
                await storage.redis.del(userId);
                if(lock)
                    lock.release();
                return 1;
            }
        } else {
            userCart[productId] = quantity;
        }
        await storage.redis.set(userId, JSON.stringify(userCart));
    }
    catch(error) {
        console.log("Error while locking.", error);
    }
    if(lock)
        lock.release();
    return 1;
}
  