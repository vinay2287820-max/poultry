const express = require("express");
const salesmanRouter = express.Router();
const multer = require("multer");
const {
  loginSalesman,
  getDueOrders,
  getAllOrder,
  updatePayment,
  getOrderDetails,
  deleteOrder,
  changeActivityStatus,
  deliverOrder,
} = require("../controllers/Salesman");

const { verifySalesmanToken } = require("../middleware/verifySalesman");
const { createOrder, cancelOrder } = require("../controllers/Orders");
const {
  getAllParties,
  getApprovedParties,
  sendPartyForApproval,
  addParty,
  updateParty,
  deleteParty,
  getRejectedParties,
} = require("../controllers/Party");

// Login
salesmanRouter.post("/login", loginSalesman);

//add party
salesmanRouter.post("/add-party", verifySalesmanToken, addParty);

//update party
salesmanRouter.put("/update-party/:partyId", verifySalesmanToken, updateParty);

//delete party
salesmanRouter.delete(
  "/delete-party/:partyId",
  verifySalesmanToken,
  deleteParty
);

//Get all the parties
salesmanRouter.get("/get-all-parties", verifySalesmanToken, getAllParties);

//Get approved parties
salesmanRouter.get(
  "/get-approved-parties",
  verifySalesmanToken,
  getApprovedParties
);

//Get rejected parties
salesmanRouter.get(
  "/get-rejected-parties",
  verifySalesmanToken,
  getRejectedParties
);

//send party for approval
salesmanRouter.post(
  "/send-party-for-approval",
  verifySalesmanToken,
  sendPartyForApproval
);

// create order
const storage = multer.memoryStorage();
const upload = multer({ storage });
salesmanRouter.post(
  "/create_order",
  verifySalesmanToken,
  upload.single("advanceAmountDocs"),
  createOrder
);

salesmanRouter.delete(
  "/delete_order/:orderId",
  verifySalesmanToken,
  deleteOrder
);
salesmanRouter.get("/get_allorder", verifySalesmanToken, getAllOrder);
salesmanRouter.get("/orders/due", verifySalesmanToken, getDueOrders);
salesmanRouter.get("/orders/:orderId", verifySalesmanToken, getOrderDetails);

salesmanRouter.post(
  "/orders/pay",
  upload.single("dueAmountDocs"),
  verifySalesmanToken,
  updatePayment
);

//cancel order
salesmanRouter.post("/cancel_order/:orderId", verifySalesmanToken, cancelOrder);

//deliver order
salesmanRouter.patch("/deliver-order", verifySalesmanToken, deliverOrder);

salesmanRouter.put(
  "/change-activity-status",
  verifySalesmanToken,
  changeActivityStatus
);

module.exports = salesmanRouter;
