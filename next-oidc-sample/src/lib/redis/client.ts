import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

// Initialize connection
(async () => {
  await redis.connect();
})();

export { redis };
