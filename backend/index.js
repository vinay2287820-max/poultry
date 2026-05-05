// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const cookieParser = require("cookie-parser");
// const http = require("http");
// const { initSocket } = require("./config/socket");
// const { client } = require("./config/redis");

// const salesmanRoutes = require("./routes/salesmanRouter");
// const adminRoutes = require("./routes/adminRouter");
// const managerRoutes = require("./routes/managerRouter");
// const authorizerRoutes = require("./routes/authorizerRouter");
// const plantHeadRoutes = require("./routes/plantheadRouter");
// const accountantRoutes = require("./routes/accountantRouter");
// const notificationRoutes = require("./routes/notificationRouter");
// const messageRoutes = require("./routes/messageRouter");
// const meRoutes = require("./routes/meRouter");

// const app = express();
// const connectDatabase = require("./config/db");
// const PORT = process.env.PORT || 5000;

// // DB connect
// connectDatabase();

// // Middlewares
// app.use(
//   cors({
//     origin: [
//       "https://poultry-feed-management-software-4.onrender.com",
//       "https://feedmanager.netlify.app",
//       "https://anand-erp.netlify.app",
//     ],
//     // origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/salesman", salesmanRoutes);
// app.use("/api/manager", managerRoutes);
// app.use("/api/authorizer", authorizerRoutes);
// app.use("/api/planthead", plantHeadRoutes);
// app.use("/api/accountant", accountantRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/me", meRoutes);

// app.get("/", (req, res) => {
//   res.send("<h1>🐣 Poultry Feed Management API Running...</h1>");
// });

// // ✅ Proper Redis + Server Startup
// (async () => {
//   try {
//     await client.connect();
//     console.log("✅ Redis Connected");

//     const server = http.createServer(app);
//     initSocket(server);

//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Redis Connection Failed", err);
//   }
// })();



const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const http = require("http");
const { initSocket } = require("./config/socket");
const { client } = require("./config/redis"); 

const salesmanRoutes = require("./routes/salesmanRouter");
const adminRoutes = require("./routes/adminRouter");
const managerRoutes = require("./routes/managerRouter");
const authorizerRoutes = require("./routes/authorizerRouter");
const plantHeadRoutes = require("./routes/plantheadRouter");
const accountantRoutes = require("./routes/accountantRouter");
const notificationRoutes = require("./routes/notificationRouter");
const messageRoutes = require("./routes/messageRouter");
const meRoutes = require("./routes/meRouter");

const app = express();
const connectDatabase = require("./config/db");
const PORT = process.env.PORT || 5000;

// DB connect
connectDatabase();

// Middlewares
app.use(
  cors({
    origin: [
      "https://poultry-feed-management-software-4.onrender.com",
      "https://anand-feed-mill.netlify.app",
      "https://anand-erp.netlify.app",
      "http://localhost:5173", 
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/salesman", salesmanRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/authorizer", authorizerRoutes);
app.use("/api/planthead", plantHeadRoutes);
app.use("/api/accountant", accountantRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/me", meRoutes);

app.get("/", (req, res) => {
  res.send("<h1>🐣 Poultry Feed Management API Running...</h1>");
});

//  Proper Startup (Connect Redis first, then start Server)
(async () => {
  try {
    // Connect to Upstash Redis
    await client.connect();

    // Start Express & Socket Server
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server Startup Failed due to Redis Error:", err.message);
    process.exit(1); // Exit process if Redis fails so Render can restart it
  }
})();
