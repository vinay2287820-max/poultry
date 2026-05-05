const Salesman = require("../models/Salesman");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getIO } = require("../config/socket.js");
const Order = require("../models/Order");
const sendNotificationToRole = require("../sendNotification");

const Warehouse = require("../models/WareHouse");

const SalesAuthorizer = require("../models/SalesAuthorizer");
const Notification = require("../models/Notification");
const Admin = require("../models/Admin.js");

const SECRET_TOKEN = process.env.JWT_SECRET || "yourSecretKey";

const loginSalesAuthorizer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find sales authorizer
    const authorizer = await SalesAuthorizer.findOne({ email });
    if (!authorizer) {
      return res.status(404).json({
        success: false,
        message: "Sales Authorizer not found",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, authorizer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: authorizer._id, role: "SalesAuthorizer" },
      SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Set cookie (optional)
    res.cookie("salesAuthorizerToken", token, {
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
        _id: authorizer._id,
        name: authorizer.name,
        email: authorizer.email,
        role: "SalesAuthorizer",
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

const getForwardedOrders = async (req, res) => {
  try {
    const authorizerId = req.user.id;

    const orders = await Order.find({
      orderStatus: {
        $in: ["ForwardedToAuthorizer", "WarehouseAssigned"],
      },
      forwardedByManager: { $exists: true },
      forwardedByAuthorizer: { $exists: false },
    })
      .populate("items.product", "name category")
      .populate("placedBy", "name email")
      .populate("party", "companyName address contactPersonNumber")
      .populate("forwardedByManager", "name email");

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Fetch error", error: err.message });
  }
};

// 3. View single order
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate("items.product", "name category price description")
      .populate("placedBy", "name email")
      .populate("party", "companyName address contactPersonNumber")
      .populate("assignedWarehouse", "name location")
      .populate("dispatchInfo.dispatchedBy", "name phone role");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Fetch error", error: err.message });
  }
};

// 4. Assign warehouse to order
const assignWarehouse = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { warehouseId } = req.body;
    const authorizerId = req.user.id;

    const order = await Order.findById(orderId).populate("items.product");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.orderStatus !== "ForwardedToAuthorizer") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign warehouse at this stage",
      });
    }

    const warehouse = await Warehouse.findById(warehouseId).populate(
      "stock.product"
    );
    if (!warehouse)
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });

    // report object
    let report = {
      warehouse: warehouse.name,
      available: [],
      insufficient: [],
      missing: [],
      canFulfill: true,
    };

    order.items.forEach((orderItem) => {
      const stockItem = warehouse.stock.find(
        (s) =>
          s?.product?._id &&
          orderItem?.product?._id &&
          String(s.product._id) === String(orderItem.product._id)
      );

      if (!stockItem) {
        report.missing.push({
          product: orderItem?.product?.name,
          requested: orderItem.quantity,
          available: 0,
        });
        report.canFulfill = false;
      } else if (stockItem.quantity < orderItem.quantity) {
        report.insufficient.push({
          product: orderItem?.product?.name,
          requested: orderItem.quantity,
          available: stockItem.quantity,
        });
        report.canFulfill = false;
      } else {
        report.available.push({
          product: orderItem?.product?.name,
          requested: orderItem.quantity,
          available: stockItem.quantity,
          remaining: stockItem.quantity - orderItem.quantity,
        });
      }
    });

    // agar fulfill nahi ho raha to sirf report bhej do
    if (!report.canFulfill) {
      return res.status(400).json({
        success: false,
        message: "Warehouse cannot fully fulfill this order",
        report,
      });
    }

    // agar fulfill ho raha hai to assign kar do
    order.assignedWarehouse = warehouseId;
    order.orderStatus = "WarehouseAssigned";
    order.warehouseAssignedByAuthorizer = authorizerId;

    await order.save();

    const currentUser = await SalesAuthorizer.findOne({ _id: authorizerId });

    const plantHeadId = warehouse?.plantHead?.toString();
    if (!plantHeadId) {
      return res.status(400).json({
        success: false,
        message: "Warehouse does not have a plant head assigned",
      });
    }

    const admins = await Admin.find().select("_id");

    const adminIds = admins.map((u) => u._id.toString());

    // const message = `Order #${order.orderId} has been assigned to ${warehouse.name} by ${currentUser?.name}`;

    // await Notification.insertOne({
    //   orderId: order.orderId,
    //   message,
    //   type: "plantAssigned",
    //   senderId: authorizerId,
    //   receiverId: plantHeadId,
    //   read: false,
    // });

    // const notifications = adminIds.map((r_id) => ({
    //   orderId: order.orderId,
    //   message,
    //   type: "plantAssigned",
    //   senderId: authorizerId,
    //   receiverId: r_id,
    //   read: false,
    // }));

    // await Notification.insertMany(notifications);

    // const io = getIO();

    // adminIds.forEach((r_id) => {
    //   io.to(r_id).emit("plantAssigned", {
    //     orderId: order.orderId,
    //     message,
    //     type: "plantAssigned",
    //     senderId: authorizerId,
    //   });
    // });

    // io.to(plantHeadId).emit("plantAssigned", {
    //   orderId: order.orderId,
    //   message,
    //   type: "plantAssigned",
    //   senderId: authorizerId,
    // });

    const payload = {
      title: `Order #${order.orderId} assigned to ${warehouse.name}`,
      message: `Order #${order.orderId} has been assigned to ${warehouse.name} by ${currentUser?.name}`,
      orderId: order.orderId,
      type: "plantAssigned",
      senderId: authorizerId,
      receiverId: [...adminIds, plantHeadId],
      read: false,
    };

    const sendToRoles = ["Admin", "PlantHead"];

    await sendNotificationToRole(sendToRoles, payload);

    return res.status(200).json({
      success: true,
      message: "Plant assigned successfully",
      report,
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: err.message,
    });
  }
};

// 5. Get warehouse assignment history
const getAssignmentHistory = async (req, res) => {
  try {
    const authorizerId = req.user.id;

    const orders = await Order.find({
      warehouseAssignedByAuthorizer: authorizerId,
      assignedWarehouse: { $exists: true },
    })
      .populate("assignedWarehouse", "name location")
      .select("assignedWarehouse orderStatus createdAt orderId");

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "History fetch error",
      error: err.message,
    });
  }
};

const checkWarehouseApproval = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("approvedBy", "name email")
      .populate("assignedWarehouse", "name location");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    const isApproved =
      order.orderStatus === "Approved" && !!order.approvedBy?._id;

    res.status(200).json({
      success: true,
      data: {
        approvedBy: order.approvedBy,
        warehouseApproved: isApproved,
        orderStatus: order.orderStatus,
        assignedWarehouse: order.assignedWarehouse,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Check failed",
      error: err.message,
    });
  }
};

const changeActivityStatus = async (req, res) => {
  const id = req.user.id;

  try {
    const salesAuthorizer = await SalesAuthorizer.findById(id);
    if (!salesAuthorizer) {
      return res.status(404).json({
        success: false,
        message: "Sales Authorizer not found",
      });
    }
    salesAuthorizer.isActive = !salesAuthorizer.isActive;
    await salesAuthorizer.save();
    res.status(200).json({
      success: true,
      message: "Sales Authorizer activity status changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing sales authorizer activity status",
      error: error.message,
    });
  }
};

const getAllWarehouse = async (req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate("stock.product", "name category price description")
      .populate("plantHead", "name email phone")
      .populate("accountant", "name email phone");

    res.status(200).json({
      success: true,
      message: "All warehouses fetched successfully.",
      data: warehouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching warehouses.",
      error: error.message,
    });
  }
};

module.exports = {
  loginSalesAuthorizer,
  getForwardedOrders,
  getOrderDetails,
  assignWarehouse,
  getAssignmentHistory,
  checkWarehouseApproval,
  changeActivityStatus,
  getAllWarehouse,
};
