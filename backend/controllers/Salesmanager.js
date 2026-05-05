const SalesManager = require("../models/SalesManager");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET_TOKEN = process.env.JWT_SECRET;
const SalesAuthorizer = require("../models/SalesAuthorizer");
const Notification = require("../models/Notification.js");
const { getIO } = require("../config/socket.js");
const Admin = require("../models/Admin.js");
const sendNotificationToRole = require("../sendNotification.js");

const loginSalesManager = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find Sales Manager by email
    const manager = await SalesManager.findOne({ email });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Sales Manager not found",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: manager._id, role: "SalesManager" },
      SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Set optional cookie
    res.cookie("salesManagerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        role: "SalesManager",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong during login",
      error: error.message,
    });
  }
};

// View assigned but unforwarded orders
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "Placed" })
      .populate("items.product", "name category description price")
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email phone");

    res.status(200).json({
      success: true,
      message: "Fetched all orders with status 'Placed'",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching assigned orders",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email phone")
      .populate("items.product", "name category description price")
      .populate("assignedWarehouse", "name location approved")
      .populate("approvedBy", "name")
      .populate("dispatchInfo.dispatchedBy", "name phone role");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};
// Forward order to Authorizer
const forwardOrderToAuthorizer = async (req, res) => {
  const { orderId } = req.params;
  const salesManagerId = req.user.id; // from verifySalesmanager middleware

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Placed") {
      return res.status(400).json({
        success: false,
        message: "Order is not in 'Placed' status",
      });
    }

    // ✅ Update to correct status and assign manager
    order.orderStatus = "ForwardedToAuthorizer";
    order.forwardedByManager = salesManagerId;

    await order.save();

    const currentUser = await SalesManager.findOne({ _id: salesManagerId });

    const authorizers = await SalesAuthorizer.find().select("_id");

    const authorizerIds = authorizers.map((u) => u._id.toString());

    const filteredAuthorizers = authorizerIds.filter(
      (id) => id !== currentUser?._id.toString()
    );

    const admins = await Admin.find().select("_id");

    const adminIds = admins.map((u) => u._id.toString());

    // const message = `Order #${order.orderId} forwarded to Authorizer by ${currentUser?.name}`;
    // const notifications = [...filteredAuthorizers, ...adminIds].map((r_id) => ({
    //   orderId: order.orderId,
    //   message,
    //   type: "orderForwardedToAuthorizer",
    //   senderId: salesManagerId,
    //   receiverId: r_id,
    //   read: false,
    // }));

    // await Notification.insertMany(notifications);

    // const io = getIO();

    // [...filteredAuthorizers, ...adminIds].forEach((r_id) => {
    //   io.to(r_id).emit("orderForwardedToAuthorizer", {
    //     orderId: order.orderId,
    //     message,
    //     type: "orderForwardedToAuthorizer",
    //     senderId: salesManagerId,
    //   });
    // });

    const payload = {
      title: `Order #${order.orderId} Forwarded to Authorizer`,
      message: `Order #${order.orderId} has been forwarded to Authorizer by ${currentUser.name}`,
      orderId: order.orderId,
      type: "orderForwardedToAuthorizer",
      senderId: salesManagerId,
      receiverId: [...filteredAuthorizers, ...adminIds],
      read: false,
    };

    const sendToRoles = ["Admin", "SalesAuthorizer"];

    await sendNotificationToRole(sendToRoles, payload);

    res.status(200).json({
      success: true,
      message: "Order forwarded to Authorizer successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error forwarding order to Authorizer",
      error: error.message,
    });
  }
};

// Get all forwarded orders by Sales this particular Manager
const getForwardedOrders = async (req, res) => {
  try {
    const salesManagerId = req.user.id;

    const orders = await Order.find({ forwardedByManager: salesManagerId })
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email phone")
      .populate("items.product", "name category");

    res.status(200).json({
      success: true,
      message: "Fetched all forwarded orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching forwarded orders",
      error: error.message,
    });
  }
};

const changeActivityStatus = async (req, res) => {
  const id = req.user.id;

  try {
    const manager = await SalesManager.findById(id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Sales manager not found",
      });
    }
    manager.isActive = !manager.isActive;
    await manager.save();
    res.status(200).json({
      success: true,
      message: "Sales manager activity status changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing sales manager activity status",
      error: error.message,
    });
  }
};

module.exports = {
  loginSalesManager,
  getAssignedOrders,
  forwardOrderToAuthorizer,
  getForwardedOrders,
  getOrderDetails,
  changeActivityStatus,
};
