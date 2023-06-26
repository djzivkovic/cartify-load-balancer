import { Redis } from "ioredis";
import Redlock from "redlock";

const redis = new Redis({
    host: process.env.REDIS_HOST || "storage",
    port: process.env.REDIS_PORT || "6379"
});

const redlock = new Redlock(
    [redis],
    {
        driftFactor: 0.01,
        retryCount: 30,
        retryDelay: 200, // time in ms
        retryJitter: 200, // time in ms
        automaticExtensionThreshold: 500, // time in ms
    }
);

const storage = {redis, redlock};

export default storage;