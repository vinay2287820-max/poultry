const Order = require("../models/Order");
const Warehouse = require("../models/WareHouse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.JWT_SECRET;
const Accountant = require("../models/Accountant");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");
const Admin = require("../models/Admin");
const sendNotificationToRole = require("../sendNotification.js");

// Login Accountant
const loginAccountant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find accountant
    const accountant = await Accountant.findOne({ email });
    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: "No Accountant found with this email",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, accountant.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate token
    const token = jwt.sign({ id: accountant._id, role: "Accountant" }, SECRET, {
      expiresIn: "1d",
    });

    // Optional: Set cookie for secure login
    res.cookie("accountantToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Respond
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: accountant._id,
        name: accountant.name,
        email: accountant.email,
        role: "Accountant",
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
};

// Get all orders with pending advance payment approval
const getOrdersToApprovePayment = async (req, res) => {
  try {
    const accountantId = req.user.id;
    const orders = await Order.find({
      orderStatus: "Approved",
      advancePaymentStatus: "SentForApproval",
      advancePaymentApprovalSentTo: accountantId,
      advanceAmount: { $gt: 0 },
      advancePaymentDoc: { $ne: null },
    })
      .populate("items.product", "name category price description")
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email");

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders to approve advance payment",
      error: err.message,
    });
  }
};

// Get all orders with pending due payment approval
const getOrdersToApproveDuePayment = async (req, res) => {
  try {
    const accountantId = req.user.id;
    const orders = await Order.find({
      duePaymentStatus: { $in: ["SentForApproval", "Approved"] },
      duePaymentApprovalSentTo: accountantId,
      paymentStatus: { $in: ["ConfirmationPending", "Paid"] },
      dueAmount: { $eq: 0 },
      dueInvoiceGenerated: false,
      duePaymentDoc: { $ne: null },
    })
      .populate("items.product", "name category")
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email")
      .populate("paymentCollectedBy", "name email");

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders to approve due payment",
      error: err.message,
    });
  }
};

// Get dispatched orders
const getDispatchedOrders = async (req, res) => {
  try {
    const AuthorizerId = req.user.id;
    const warehouse = await Warehouse.findOne({ accountant: req.user.id });
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not assigned to this accountant",
      });
    }

    const orders = await Order.find({
      assignedWarehouse: String(warehouse._id),
      orderStatus: "Dispatched",
    })
      .populate("items.product", "name category")
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email");

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dispatched orders",
      error: err.message,
    });
  }
};

//approve the advance payment
const approveOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const accountantId = req.user.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    order.orderStatus = "ForwardedToPlantHead";
    order.advancePaymentStatus = "Approved";
    if (order.dueAmount > 0) {
      order.paymentStatus = "PendingDues";
    }
    if (order.dueAmount === 0) {
      order.paymentStatus = "Paid";
    }
    order.advancePaymentApprovedBy = accountantId;

    const salesmanId = order.placedBy.toString();

    const payload = {
      title: `Advance payment approved`,
      message: `Advance payment approved for order #${order.orderId}`,
      orderId: order.orderId,
      type: "advancePaymentApproved",
      senderId: accountantId,
      receiverId: salesmanId,
      read: false,
    };

    const sendToRoles = ["Salesman"];

    await sendNotificationToRole(sendToRoles, payload);

    await order.save();
    res.status(200).json({
      success: true,
      message: "Advance Payment approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve advance payment",
      error: error.message,
    });
  }
};

//approve the due payment
const approveDuePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const accountantId = req.user.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.duePaymentStatus = "Approved";
    if (
      order.advanceAmount === 0 ||
      (order.advancePaymentStatus === "Approved" && order.dueAmount === 0)
    ) {
      order.paymentStatus = "Paid";
    }
    order.duePaymentApprovedBy = accountantId;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Due Payment approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve due payment",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email")
      .populate("assignedWarehouse", "name location")
      .populate("items.product", "name category price description")
      .populate("invoiceDetails.invoicedBy", "name email")
      .populate(
        "invoiceDetails.party",
        "companyName address contactPersonNumber"
      )
      .populate(
        "dueInvoiceDetails.party",
        "companyName address contactPersonNumber"
      )
      .populate("dueInvoiceDetails.invoicedBy", "name email")
      .populate("dispatchInfo.dispatchedBy", "name email phone")
      .populate("paymentCollectedBy", "name email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: err.message,
    });
  }
};

// Generate Invoice
const generateInvoice = async (req, res) => {
  try {
    const accountantId = req.user.id;
    const { orderId } = req.params;
    const { dueDate } = req.body;

    const warehouse = await Warehouse.findOne({ accountant: accountantId });
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found for this accountant",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || String(order.assignedWarehouse) !== String(warehouse._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to invoice this order",
      });
    }

    if (order.invoiceGenerated) {
      return res
        .status(400)
        .json({ success: false, message: "Invoice already generated" });
    }

    order.invoiceGenerated = true;
    order.invoiceDetails = {
      totalAmount: order.totalAmount,
      advanceAmount: order.advanceAmount,
      dueAmount: order.dueAmount,
      dueDate: dueDate || new Date(),
      paymentMode: order.paymentMode,
      party: order.party,
      invoicedBy: accountantId,
      generatedAt: new Date(),
    };

    await order.save();

    const admins = await Admin.find().select("_id");

    const accountant = await Accountant.findById(accountantId);

    const adminIds = admins.map((u) => u._id.toString());

    const salesmanId = order?.placedBy.toString();

    const payload = {
      title: `Invoice for order #${order.orderId} has been generated`,
      message: `Invoice for order #${order.orderId} has been generated by ${accountant?.name}`,
      orderId: order.orderId,
      type: "invoiceGenerated",
      senderId: accountantId,
      receiverId: [...adminIds, salesmanId],
      read: false,
    };

    const sendToRoles = ["Admin", "Salesman"];

    await sendNotificationToRole(sendToRoles, payload);

    res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Invoice generation failed",
      error: err.message,
    });
  }
};

// Generate Invoice for due amount again
const generateDueInvoice = async (req, res) => {
  try {
    const accountantId = req.user.id;
    const { orderId } = req.params;
    const { dueDate } = req.body;
    const warehouse = await Warehouse.findOne({ accountant: accountantId });
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found for this accountant",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || String(order.assignedWarehouse) !== String(warehouse._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to invoice this order",
      });
    }

    if (order.dueInvoiceGenerated) {
      return res
        .status(400)
        .json({ success: false, message: "Due Invoice already generated" });
    }

    order.dueInvoiceGenerated = true;
    order.dueInvoiceDetails = {
      totalAmount: order.totalAmount,
      advanceAmount: order.advanceAmount,
      dueAmount: order.dueAmount,
      dueDate: dueDate || new Date(),
      duePaymentMode: order.duePaymentMode,
      party: order.party,
      invoicedBy: accountantId,
      generatedAt: new Date(),
    };

    await order.save();

    const accountant = await Accountant.findById(accountantId);

    const salesmanId = order?.placedBy.toString();

    const admins = await Admin.find().select("_id");

    const adminIds = admins.map((u) => u._id.toString());

    const payload = {
      title: `Due invoice for order #${order.orderId} has been generated`,
      message: `Due invoice for order #${order.orderId} has been generated by ${accountant?.name}`,
      orderId: order.orderId,
      type: "dueInvoiceGenerated",
      senderId: accountantId,
      receiverId: [...adminIds, salesmanId],
      read: false,
    };

    const sendToRoles = ["Admin", "Salesman"];

    await sendNotificationToRole(sendToRoles, payload);

    res.status(200).json({
      success: true,
      message: "Due Invoice generated successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Due Invoice generation failed",
      error: err.message,
    });
  }
};

// Get Invoice by Order ID
const getInvoiceDetails = async (req, res) => {
  try {
    const accountantId = req.user.id;
    const { orderId } = req.params;

    const warehouse = await Warehouse.findOne({ accountant: accountantId });
    if (!warehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not assigned" });
    }

    const order = await Order.findById(orderId)
      .populate("invoicedBy", "name email")
      .populate("party", "contactPersonNumber address companyName")
      .populate("placedBy", "name")
      .populate("assignedWarehouse", "name")
      .populate("dispatchInfo.dispatchedBy", "name");

    if (
      !order ||
      String(order.assignedWarehouse._id) !== String(warehouse._id)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied to this order" });
    }

    if (!order.invoiceGenerated) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not generated yet" });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        advanceAmount: order.advanceAmount,
        dueAmount: order.dueAmount,
        dueDate: order.dueDate,
        party: order.party,
        invoicedBy: order.invoicedBy,
        generatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve invoice",
      error: err.message,
    });
  }
};

const changeActivityStatus = async (req, res) => {
  const id = req.user.id;

  try {
    const accountant = await Accountant.findById(id);
    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: "Accountant not found",
      });
    }
    accountant.isActive = !accountant.isActive;
    await accountant.save();
    res.status(200).json({
      success: true,
      message: "Accountant activity status changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while changing accountant activity status",
      error: error.message,
    });
  }
};

module.exports = {
  loginAccountant,
  getDispatchedOrders,
  generateInvoice,
  generateDueInvoice,
  getInvoiceDetails,
  changeActivityStatus,
  getOrderDetails,
  getOrdersToApprovePayment,
  getOrdersToApproveDuePayment,
  approveOrderPayment,
  approveDuePayment,
};
