const express = require("express");
const meController = require("../controllers/me");
const verifyToken = require("../middleware/verifyToken");
const meRouter = express.Router();

meRouter.get("/", verifyToken, meController);

module.exports = meRouter;
