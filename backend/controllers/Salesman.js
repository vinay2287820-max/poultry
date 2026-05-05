const Salesman = require("../models/Salesman");
const Order = require("../models/Order");
const Warehouse = require("../models/WareHouse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Party = require("../models/Party");
const SECRET_TOKEN = process.env.JWT_SECRET;
const imagekit = require("../config/imagekit");
const Admin = require("../models/Admin");
const { getIO } = require("../config/socket");
const Notification = require("../models/Notification");
const sendNotificationToRole = require("../sendNotification");

const loginSalesman = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find salesman by email
    const salesman = await Salesman.findOne({ email });
    if (!salesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, salesman.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token with uniform structure
    const token = jwt.sign(
      { id: salesman._id, role: "Salesman" },
      SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Optional: Set cookie
    res.cookie("salesmanToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: salesman._id,
        name: salesman.name,
        email: salesman.email,
        role: "Salesman",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
      error: error.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const salesmanId = req.user.id; // set by verifySalesmanToken middleware

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the logged-in salesman placed the order
    if (order.placedBy.toString() !== salesmanId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own orders.",
      });
    }

    // Prevent deletion if order is already forwarded
    const forwardSteps = [
      "ForwardedToAuthorizer",
      "WarehouseAssigned",
      "Approved",
      "Dispatched",
      "Delivered",
      "Paid",
    ];

    if (forwardSteps.includes(order.orderStatus)) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete the order. It has already been processed.",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the order",
      error: error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  const { amount, paymentMode, orderId } = req.body;
  const salesmanId = req.user.id;

  if (!amount || !paymentMode) {
    return res.status(422).json({
      success: false,
      message: "Amount and payment mode are required",
    });
  }

  try {
    let duePaymentProof;
    if (req.file?.buffer) {
      duePaymentProof = await imagekit.upload({
        file: req.file?.buffer,
        fileName: req.file.originalname,
        folder: "/dueAmountDocs",
      });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const warehouse = await Warehouse.findOne(order.assignedWarehouse);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const party = await Party.findById(order.party);
    if (!party) return res.json({ success: false, message: "Party not found" });

    // Validate order belongs to that salesman
    if (order.placedBy.toString() !== salesmanId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this order payment",
      });
    }

    // Prevent overpayment
    if (amount > order.dueAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds due amount",
      });
    }

    // Update payment info
    const newDueAmount = Number(order.dueAmount) - Number(amount);
    order.dueAmount = newDueAmount;

    if (order.advanceAmount === 0 && newDueAmount === 0) {
      order.paymentStatus = "ConfirmationPending";
      order.duePaymentMode = paymentMode;
      order.duePaymentStatus = "SentForApproval";
    }
    if (order.advanceAmount > 0 && newDueAmount === 0) {
      order.paymentStatus = "ConfirmationPending";
      order.duePaymentMode = paymentMode;
      order.duePaymentStatus = "SentForApproval";
    }
    if (order.advanceAmount > 0 && newDueAmount > 0) {
      order.paymentStatus = "ConfirmationPending";
      order.duePaymentMode = paymentMode;
      order.duePaymentStatus = "SentForApproval";
      if (order.advancePaymentStatus !== "Approved") {
        order.advancePaymentStatus = "Pending";
      }
    }

    let updatedLimit = Number(party.limit) + Number(amount);

    party.limit = Number(updatedLimit);

    order.paymentCollectedBy = salesmanId;
    order.duePaymentDoc = duePaymentProof?.url;
    order.duePaymentApprovalSentTo = warehouse.accountant._id;
    await order.save();
    await party.save();

    // Update salesman collection log
    await Salesman.findByIdAndUpdate(
      salesmanId,
      {
        $push: {
          collectedPayments: {
            order: order._id,
            amount,
            paymentMode,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    const accountantId = warehouse?.accountant.toString();

    const payload = {
      title: `Check and confirm due payment`,
      message: `Check and confirm due payment of ₹${amount} for Order #${order.orderId} from ${party?.companyName}.`,
      orderId: order.orderId,
      type: "dueSentForApproval",
      senderId: accountantId,
      receiverId: [accountantId],
      read: false,
    };

    const sendToRoles = ["Accountant"];

    await sendNotificationToRole(sendToRoles, payload);

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: {
        orderId: order._id,
        newDueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get due orders
const getDueOrders = async (req, res) => {
  const salesmanId = req.user.id; // set by verifySalesmanToken middleware.
  try {
    const dueOrders = await Order.find({
      placedBy: salesmanId,
      dueAmount: { $gt: 0 },
      orderStatus: { $ne: "Paid" },
    })
      .populate("party", "companyName contactPersonNumber address")
      .populate("items.product", "name price description category");

    res.status(200).json({
      success: true,
      data: dueOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching due orders",
      error: error.message,
    });
  }
};

// Dashboard (sales, due, dispatch)
const getAllOrder = async (req, res) => {
  const salesmanId = req.user.id; // set by verifySalesmanToken middleware

  try {
    const orders = await Order.find({ placedBy: salesmanId })
      .populate("items.product", "name price description category")
      .populate("party", "companyName contactPersonNumber address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching orders",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  const orderId = req.params.orderId;
  const salesmanId = req.user.id; // set by verifySalesmanToken middleware

  try {
    const order = await Order.findById(orderId)
      .populate("items.product", "name price category description")
      .populate("party", "companyName address contactPersonNumber")
      .populate("placedBy", "name email")
      .populate("assignedWarehouse", "name location approved")
      .populate("dispatchInfo.dispatchedBy", "name email phone")
      .populate("invoiceDetails.invoicedBy", "name email phone")
      .populate(
        "invoiceDetails.party",
        "companyName address contactPersonNumber"
      )
      .populate(
        "dueInvoiceDetails.party",
        "companyName address contactPersonNumber"
      )
      .populate("dueInvoiceDetails.invoicedBy", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.placedBy._id.toString() !== salesmanId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only view your own orders.",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching order details",
      error: error.message,
    });
  }
};

const changeActivityStatus = async (req, res) => {
  const id = req.user.id;

  try {
    const salesman = await Salesman.findById(id);
    if (!salesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }
    salesman.isActive = !salesman.isActive;
    await salesman.save();
    res.status(200).json({
      success: true,
      message: "Salesman activity status changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while changing salesman activity status",
      error: error.message,
    });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const salesmanId = req.user.id;
    const { orderId } = req.body;
    const order = await Order.findOne({
      placedBy: salesmanId,
      _id: orderId,
    }).populate("placedBy", "name");
    if (!order) return res.json({ message: "Order not found", success: false });

    order.orderStatus = "Delivered";

    await order.save();

    const admins = await Admin.find().select("_id");

    const adminIds = admins.map((u) => u._id.toString());

    // const message = `Order #${order?.orderId} has been delivered by ${order?.placedBy?.name}`;

    // const notifications = adminIds.map((r_id) => ({
    //   orderId: order?.orderId,
    //   message,
    //   type: "delivered",
    //   senderId: salesmanId,
    //   receiverId: r_id,
    //   read: false,
    // }));

    // await Notification.insertMany(notifications);

    // const io = getIO();

    // adminIds.forEach((r_id) => {
    //   io.to(r_id).emit("delivered", {
    //     orderId: order?.orderId,
    //     message,
    //     type: "delivered",
    //     senderId: salesmanId,
    //   });
    // });

    const payload = {
      title: `Order #${order?.orderId} delivered`,
      message: `Order #${order?.orderId} has been delivered by ${order?.placedBy?.name}.`,
      orderId: order.orderId,
      type: "delivered",
      senderId: salesmanId,
      receiverId: [adminIds],
      read: false,
    };

    const sendToRoles = ["Admin"];

    await sendNotificationToRole(sendToRoles, payload);

    return res.json({
      message: "Order delivered successfully",
      success: true,
    });
  } catch (err) {
    return res.json({
      message: "Unable to deliver order",
      error: err.message,
      success: false,
    });
  }
};

module.exports = {
  deleteOrder,
  loginSalesman,
  getDueOrders,
  updatePayment,
  getAllOrder,
  getOrderDetails,
  changeActivityStatus,
  deliverOrder,
};
