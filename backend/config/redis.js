// const { createClient } = require("redis");

// const client = createClient({
//   username: "default",
//   password: "GnFP7kytLp6IZzytToJ5KbAlnSpCOjG7",
//   socket: {
//     host: "redis-15933.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
//     port: 15933,
//   },
// });

// client.on("error", (err) => console.log("Redis Client Error", err));

// module.exports = { client };

const { createClient } = require("redis");
require("dotenv").config();

// Initialize the Redis client using the secure Upstash URL
const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("connect", () => console.log("⏳ Connecting to Upstash Redis..."));
client.on("ready", () =>
  console.log("✅ Upstash Redis Connected Successfully"),
);
client.on("error", (err) =>
  console.error("❌ Redis Client Error:", err.message),
);

module.exports = { client };