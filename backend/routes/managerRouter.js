const express = require("express");
const managerRouter = express.Router();
const {
  loginSalesManager,
  getAssignedOrders,
  forwardOrderToAuthorizer,
  getOrderDetails,
  getForwardedOrders,
  changeActivityStatus,
} = require("../controllers/Salesmanager");

const { verifySalesmanager } = require("../middleware/verifySalesmanager");
const { cancelOrder } = require("../controllers/Orders");

// Sales Manager Login
managerRouter.post("/login", loginSalesManager);

// View all orders assigned to this Sales Manager (not yet forwarded)
managerRouter.get("/orders/getAll", verifySalesmanager, getAssignedOrders);

// Get all forwarded orders
managerRouter.get("/orders/forwarded", verifySalesmanager, getForwardedOrders);

managerRouter.get("/orders/:orderId", verifySalesmanager, getOrderDetails);

// Forward order to Authorizer
managerRouter.put(
  "/forward/:orderId",
  verifySalesmanager,
  forwardOrderToAuthorizer
);

managerRouter.post("/cancel_order/:orderId", verifySalesmanager, cancelOrder);

managerRouter.put(
  "/change-activity-status",
  verifySalesmanager,
  changeActivityStatus
);

module.exports = managerRouter;
