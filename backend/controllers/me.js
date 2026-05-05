const Accountant = require("../models/Accountant");
const Admin = require("../models/Admin");
const PlantHead = require("../models/PlantHead");
const SalesAuthorizer = require("../models/SalesAuthorizer");
const Salesman = require("../models/Salesman");
const SalesManager = require("../models/SalesManager");

const meController = async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === "Admin") {
      const user = await Admin.findById(id).select("email name role isActive");
      res.json({ success: true, data: user });
    }
    if (role === "Salesman") {
      const user = await Salesman.findById(id).select(
        "email name role isActive"
      );
      res.json({ success: true, data: user });
    }
    if (role === "SalesAuthorizer") {
      const user = await SalesAuthorizer.findById(id).select(
        "email name role isActive"
      );
      res.json({ success: true, data: user });
    }
    if (role === "SalesManager") {
      const user = await SalesManager.findById(id).select(
        "email name role isActive"
      );
      res.json({ success: true, data: user });
    }
    if (role === "PlantHead") {
      const user = await PlantHead.findById(id).select(
        "email name role isActive"
      );
      res.json({ success: true, data: user });
    }
    if (role === "Accountant") {
      const user = await Accountant.findById(id).select(
        "email name role isActive"
      );
      res.json({ success: true, data: user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid role isActive" });
  }
};

module.exports = meController;
