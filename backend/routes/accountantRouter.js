const express = require("express");
const accountantRouter = express.Router();
const {
  loginAccountant,
  getDispatchedOrders,
  generateInvoice,
  getInvoiceDetails,
  changeActivityStatus,
  getOrderDetails,
  getOrdersToApprovePayment,
  approveOrderPayment,
  approveDuePayment,
  getOrdersToApproveDuePayment,
  generateDueInvoice,
} = require("../controllers/Accountant");
const { verifyAccountant } = require("../middleware/verifyAccountant");

// Login
accountantRouter.post("/login", loginAccountant);

// Protected Routes
accountantRouter.get(
  "/dispatched-orders",
  verifyAccountant,
  getDispatchedOrders
);

//Get Order Details
accountantRouter.get("/order/:orderId", verifyAccountant, getOrderDetails);

//generate invoice
accountantRouter.post(
  "/generate-invoice/:orderId",
  verifyAccountant,
  generateInvoice
);

//generate due invoice
accountantRouter.post(
  "/generate-due-invoice/:orderId",
  verifyAccountant,
  generateDueInvoice
);

accountantRouter.get("/invoice/:orderId", verifyAccountant, getInvoiceDetails);

//get orders with pending advance payment approval
accountantRouter.get(
  "/orders-to-approve-payment",
  verifyAccountant,
  getOrdersToApprovePayment
);

//get orders with pending due payment approval
accountantRouter.get(
  "/orders-to-approve-due-payment",
  verifyAccountant,
  getOrdersToApproveDuePayment
);

//approve advance payment
accountantRouter.put(
  "/approve-advance-payment",
  verifyAccountant,
  approveOrderPayment
);

//approve due payment
accountantRouter.put(
  "/approve-due-payment",
  verifyAccountant,
  approveDuePayment
);

accountantRouter.put(
  "/change-activity-status",
  verifyAccountant,
  changeActivityStatus
);

module.exports = accountantRouter;
