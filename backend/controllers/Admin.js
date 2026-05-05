const adminModel = require("../models/Admin");
const salesmanModel = require("../models/Salesman");
const salesManagerModel = require("../models/SalesManager");
const salesAuthorizerModel = require("../models/SalesAuthorizer");
const accountantModel = require("../models/Accountant");
const plantHeadModel = require("../models/PlantHead");
const Product = require("../models/Product");
const orderModel = require("../models/Order");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Warehouse = require("../models/WareHouse");

const SECRET_TOKEN = process.env.JWT_SECRET;

const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

const saltRounds = 10;
const admin_key = process.env.PFM_SECRET_KEY;

// Utility function to validate email
const isCorrectEmail = (email) => {
  const regrex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regrex.test(email);
};

// Register Admin Controller
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, key } = req.body;

    if (!name || !email || !password || !key) {
      return res.status(422).json({
        success: false,
        message: "All fields (name, email, password, key) are required",
      });
    }

    if (!isCorrectEmail(email)) {
      return res.status(422).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (key !== admin_key) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Invalid Secret Key",
      });
    }

    // Check for existing admin
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Contact the Development Team.",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin
    const isAdmin = await adminModel.findOne({ email });
    if (!isAdmin) {
      return res.status(404).json({
        success: false,
        message: "No Admin found with this email",
      });
    }

    // Check password
    const isMatched = await bcrypt.compare(password, isAdmin.password);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: isAdmin._id, role: "Admin" }, // Use uniform structure
      SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Set cookie (optional for frontend auth handling)
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: isAdmin._id,
        name: isAdmin.name,
        email: isAdmin.email,
        role: "Admin",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const addSalesman = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(422).json({
      success: false,
      message: "Missing input fields",
    });
  }

  if (!isCorrectEmail(email)) {
    return res.status(422).json({
      success: false,
      message: "Incorrect email format!",
    });
  }

  const isExist = await salesmanModel.findOne({ email });
  if (isExist) {
    return res.status(409).json({
      success: false,
      message: "Email already used by another salesman",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash here

    const salesman = await salesmanModel.create({
      name,
      email,
      password: hashedPassword, // Save hashed password
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Salesman created successfully",
      data: {
        _id: salesman._id,
        name: salesman.name,
        email: salesman.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the dev team.",
      error: error.message,
    });
  }
};

const getAllSalesman = async (req, res) => {
  try {
    const salesmen = await salesmanModel.find().select("-password");
    res.status(200).json({
      success: true,
      message: "All salesmen fetched successfully",
      data: salesmen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const getSalesman = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Salesman ID is required",
    });
  }

  try {
    const salesman = await salesmanModel.findById(id).select("-password");
    if (!salesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Salesman fetched successfully",
      data: salesman,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const updateSalesman = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;
  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Salesman ID is required",
    });
  }
  try {
    const salesman = await salesmanModel.findById(id);
    if (!salesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }
    if (name) {
      salesman.name = name;
    }
    if (email) {
      salesman.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash here
      salesman.password = hashedPassword; // Save hashed password
    }
    if (phone) {
      salesman.phone = phone;
    }
    await salesman.save();
    res.status(200).json({
      success: true,
      message: "Salesman updated successfully",
      data: salesman,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const deleteSalesman = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Salesman ID is required",
    });
  }

  try {
    const deletedSalesman = await salesmanModel.findByIdAndDelete(id);
    if (!deletedSalesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Salesman deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const addSalesManager = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(422).json({
      success: false,
      message: "Missing input fields",
    });
  }

  if (!isCorrectEmail(email)) {
    return res.status(422).json({
      success: false,
      message: "Incorrect email format!",
    });
  }

  try {
    // Check for duplicate email
    const existing = await salesManagerModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already used by another Sales Manager",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const salesManager = await salesManagerModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Sales Manager created successfully",
      data: {
        _id: salesManager._id,
        name: salesManager.name,
        email: salesManager.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, try contacting the development team.",
      error: error.message,
    });
  }
};

const getAllSalesManager = async (req, res) => {
  try {
    const salesManagers = await salesManagerModel.find().select("-password");
    res.status(200).json({
      success: true,
      message: "All Sales Managers fetched successfully",
      data: salesManagers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const getSalesManager = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Manager ID is required",
    });
  }

  try {
    const salesManager = await salesManagerModel
      .findById(id)
      .select("-password");
    if (!salesManager) {
      return res.status(404).json({
        success: false,
        message: "Sales Manager not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Sales Manager fetched successfully",
      data: salesManager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const updateSalesManager = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;

  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Manager ID is required",
    });
  }

  try {
    const salesManager = await salesManagerModel.findById(id);
    if (!salesManager) {
      return res.status(404).json({
        success: false,
        message: "Sales Manager not found",
      });
    }

    if (name) salesManager.name = name;
    if (email) salesManager.email = email;
    if (password)
      salesManager.password = await bcrypt.hash(password, saltRounds);
    if (phone) salesManager.phone = phone;

    await salesManager.save();

    res.status(200).json({
      success: true,
      message: "Sales Manager updated successfully",
      data: salesManager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const deleteSalesManager = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Manager ID is required",
    });
  }
  try {
    const deletedSalesManager = await salesManagerModel.findByIdAndDelete(id);
    if (!deletedSalesManager) {
      return res.status(404).json({
        success: false,
        message: "Sales Manager not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Sales Manager deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const addSalesAuthorizer = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    return res.status(422).json({
      success: false,
      message: "Missing input fields",
    });
  }

  if (!isCorrectEmail(email)) {
    return res.status(422).json({
      success: false,
      message: "Incorrect email format!",
    });
  }

  try {
    // Check for existing authorizer with same email
    const existing = await salesAuthorizerModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already used by another Sales Authorizer",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new Sales Authorizer
    const newAuthorizer = await salesAuthorizerModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Return response
    res.status(201).json({
      success: true,
      message: "Sales Authorizer created successfully",
      data: {
        _id: newAuthorizer._id,
        name: newAuthorizer.name,
        email: newAuthorizer.email,
        phone: newAuthorizer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const getAllSalesAuthorizer = async (req, res) => {
  try {
    const salesAuthorizers = await salesAuthorizerModel
      .find()
      .select("-password");
    res.status(200).json({
      success: true,
      message: "Sales Authorizers fetched successfully",
      data: salesAuthorizers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const getSalesAuthorizer = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Authorizer ID is required",
    });
  }
  try {
    const salesAuthorizer = await salesAuthorizerModel
      .findById(id)
      .select("-password");
    if (!salesAuthorizer) {
      return res.status(404).json({
        success: false,
        message: "Sales Authorizer not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Sales Authorizer fetched successfully",
      data: salesAuthorizer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const updateSalesAuthorizer = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;

  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Authorizer ID is required",
    });
  }

  try {
    const salesAuthorizer = await salesAuthorizerModel.findById(id);
    if (!salesAuthorizer) {
      return res.status(404).json({
        success: false,
        message: "Sales Authorizer not found",
      });
    }

    if (name) salesAuthorizer.name = name;
    if (email) salesAuthorizer.email = email;
    if (password) salesAuthorizer.password = password;
    if (phone) salesAuthorizer.phone = phone;

    await salesAuthorizer.save();

    res.status(200).json({
      success: true,
      message: "Sales Authorizer updated successfully",
      data: salesAuthorizer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const deleteSalesAuthorizer = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(422).json({
      success: false,
      message: "Sales Authorizer ID is required",
    });
  }
  try {
    const deletedSalesAuthorizer = await salesAuthorizerModel.findByIdAndDelete(
      id
    );
    if (!deletedSalesAuthorizer) {
      return res.status(404).json({
        success: false,
        message: "Sales Authorizer not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Sales Authorizer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please contact the development team.",
      error: error.message,
    });
  }
};

const addPlantHead = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res
      .status(422)
      .json({ success: false, message: "Missing input fields" });
  }

  if (!isCorrectEmail(email)) {
    return res
      .status(422)
      .json({ success: false, message: "Incorrect email format!" });
  }

  const existing = await plantHeadModel.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newPlantHead = await plantHeadModel.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  res.status(201).json({
    success: true,
    message: "Plant Head created successfully",
    data: { _id: newPlantHead._id, name, email, phone },
  });
};

const getAllPlantHeads = async (req, res) => {
  try {
    const heads = await plantHeadModel.find().select("-password");
    res
      .status(200)
      .json({ success: true, message: "All Plant Heads", data: heads });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getPlantHead = async (req, res) => {
  const { id } = req.params;
  const head = await plantHeadModel.findById(id).select("-password");
  if (!head)
    return res
      .status(404)
      .json({ success: false, message: "Plant Head not found" });
  res.status(200).json({ success: true, data: head });
};

const updatePlantHead = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;

  if (!id) {
    return res
      .status(422)
      .json({ success: false, message: "Plant Head ID is required" });
  }

  try {
    const head = await plantHeadModel.findById(id);
    if (!head) {
      return res
        .status(404)
        .json({ success: false, message: "Plant Head not found" });
    }

    if (name) head.name = name;
    if (email) head.email = email;
    if (password) head.password = await bcrypt.hash(password, saltRounds);
    if (phone) head.phone = phone;

    await head.save();
    res.status(200).json({
      success: true,
      message: "Plant Head updated successfully",
      data: head,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Plant Head",
      error: error.message,
    });
  }
};
const deletePlantHead = async (req, res) => {
  const { id } = req.params;
  const deleted = await plantHeadModel.findByIdAndDelete(id);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Plant Head not found" });
  res.status(200).json({ success: true, message: "Deleted successfully" });
};

const addAccountant = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res
        .status(422)
        .json({ success: false, message: "Missing input fields" });
    }

    if (!isCorrectEmail(email)) {
      return res
        .status(422)
        .json({ success: false, message: "Incorrect email format!" });
    }

    const existing = await accountantModel.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newAccountant = await accountantModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Accountant created successfully",
      data: { _id: newAccountant._id, name, email, phone },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getAllAccountants = async (req, res) => {
  try {
    const data = await accountantModel.find().select("-password");
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAccountant = async (req, res) => {
  const { id } = req.params;
  const acc = await accountantModel.findById(id).select("-password");
  if (!acc)
    return res
      .status(404)
      .json({ success: false, message: "Accountant not found" });
  res.status(200).json({ success: true, data: acc });
};

const updateAccountant = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;

  if (!id) {
    return res
      .status(422)
      .json({ success: false, message: "Accountant ID is required" });
  }

  try {
    const accountant = await accountantModel.findById(id);
    if (!accountant) {
      return res
        .status(404)
        .json({ success: false, message: "Accountant not found" });
    }

    if (name) accountant.name = name;
    if (email) accountant.email = email;
    if (password) accountant.password = await bcrypt.hash(password, saltRounds);
    if (phone) accountant.phone = phone;

    await accountant.save();
    res.status(200).json({
      success: true,
      message: "Accountant updated successfully",
      data: accountant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating accountant",
      error: error.message,
    });
  }
};
const deleteAccountant = async (req, res) => {
  const { id } = req.params;
  const deleted = await accountantModel.findByIdAndDelete(id);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Accountant not found" });
  res.status(200).json({ success: true, message: "Accountant deleted" });
};

const addWarehouse = async (req, res) => {
  try {
    const { name, location, plantHead, accountant } = req.body;

    if (!name || !location || !plantHead || !accountant) {
      return res.status(422).json({
        success: false,
        message:
          "All fields (name, location, plantHead, accountant) are required.",
      });
    }

    // Check if plantHead exists
    const existingPlantHead = await plantHeadModel.findById(plantHead);
    if (!existingPlantHead) {
      return res.status(404).json({
        success: false,
        message: "Invalid PlantHead ID. Please select a valid one.",
      });
    }

    // Check if accountant exists
    const existingAccountant = await accountantModel.findById(accountant);
    if (!existingAccountant) {
      return res.status(404).json({
        success: false,
        message: "Invalid Accountant ID. Please select a valid one.",
      });
    }

    // Check if the selected plantHead or accountant is already assigned to a warehouse
    const plantHeadInUse = await Warehouse.findOne({ plantHead });
    const accountantInUse = await Warehouse.findOne({ accountant });

    if (plantHeadInUse) {
      return res.status(400).json({
        success: false,
        message: "This Plant Head is already assigned to another warehouse.",
      });
    }

    if (accountantInUse) {
      return res.status(400).json({
        success: false,
        message: "This Accountant is already assigned to another warehouse.",
      });
    }

    // Create warehouse
    const warehouse = await Warehouse.create({
      name,
      location,
      plantHead,
      accountant,
    });

    res.status(201).json({
      success: true,
      message: "Warehouse created and assigned successfully.",
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while adding the warehouse.",
      error: error.message,
    });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { name, location, plantHead, accountant } = req.body;

    // 1. Fetch existing warehouse
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // 2. If plantHead is being updated
    if (plantHead && plantHead !== warehouse.plantHead.toString()) {
      const existingPlantHead = await plantHeadModel.findById(plantHead);
      if (!existingPlantHead) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid Plant Head ID" });
      }

      const alreadyAssigned = await Warehouse.findOne({ plantHead });
      if (alreadyAssigned && alreadyAssigned._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "This Plant Head is already assigned to another warehouse",
        });
      }

      warehouse.plantHead = plantHead;
    }

    // 3. If accountant is being updated
    if (accountant && accountant !== warehouse.accountant.toString()) {
      const existingAccountant = await accountantModel.findById(accountant);
      if (!existingAccountant) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid Accountant ID" });
      }

      const alreadyAssigned = await Warehouse.findOne({ accountant });
      if (alreadyAssigned && alreadyAssigned._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "This Accountant is already assigned to another warehouse",
        });
      }

      warehouse.accountant = accountant;
    }

    // 4. Update name and location if provided
    if (name) warehouse.name = name;
    if (location) warehouse.location = location;

    // 5. Save changes
    await warehouse.save();

    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the warehouse",
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

const getWarehouse = async (req, res) => {
  const { warehouseId } = req.params;

  if (!warehouseId) {
    return res.status(422).json({
      success: false,
      message: "Warehouse ID is required",
    });
  }

  try {
    // 1. Get warehouse with stock, plantHead, accountant, and product details
    const warehouse = await Warehouse.findById(warehouseId)
      .populate("plantHead", "name email phone")
      .populate("accountant", "name email phone")
      .populate("stock.product", "name category price description");

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // 2. Get all assigned orders (where this warehouse is assigned)
    const assignedOrders = await orderModel
      .find({ assignedWarehouse: warehouseId })
      .populate("placedBy", "name email")
      .populate("party", "companyName")
      .populate("items.product", "name category price description")
      .sort({ createdAt: -1 });

    // 3. Get all dispatched orders from this warehouse
    const dispatchedOrders = assignedOrders.filter(
      (order) =>
        order.orderStatus === "Dispatched" ||
        order.orderStatus === "Delivered" ||
        order.orderStatus === "Paid"
    );

    // 4. Calculate total earnings (only from dispatched orders)
    const totalEarnings = dispatchedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: {
        warehouse,
        stock: warehouse.stock,
        assignedOrders,
        dispatchedOrders,
        totalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the warehouse.",
      error: error.message,
    });
  }
};

const addProductToWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { productId } = req.body;

    // Check warehouse
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });
    }

    // Check product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if product already exists in stock
    const alreadyExists = warehouse.stock.some(
      (item) => item.product.toString() === productId
    );
    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already added to warehouse",
      });
    }

    // Add product with quantity 0
    warehouse.stock.push({
      product: productId,
      quantity: 0,
    });

    await warehouse.save();

    res.status(200).json({
      success: true,
      message: "Product added to warehouse",
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding product to warehouse",
      error: err.message,
    });
  }
};

//OK
const getAllProductsFromWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId).populate(
      "stock.product"
    );
    if (!warehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });
    }

    const productList = warehouse.stock.map((stockItem) => ({
      productId: stockItem.product._id,
      name: stockItem.product.name,
      category: stockItem.product.category,
      description: stockItem.product.description,
      price: stockItem.product.price,
      quantity: stockItem.quantity,
    }));

    res.status(200).json({
      success: true,
      message: "Products in warehouse fetched",
      data: productList,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: err.message,
    });
  }
};

const deleteProductsFromWarehouse = async (req, res) => {
  try {
    const { warehouseId, productId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse)
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });

    const index = warehouse.stock.findIndex(
      (item) => item.product.toString() === productId
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in stock" });
    }

    warehouse.stock.splice(index, 1);
    await warehouse.save();

    res
      .status(200)
      .json({ success: true, message: "Product removed from warehouse stock" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: err.message,
    });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const deleted = await Warehouse.findByIdAndDelete(warehouseId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete warehouse.",
      error: error.message,
    });
  }
};

const addProduct = async (req, res) => {
  try {
    let { name, category, description, price } = req.body;

    // Normalize both to lowercase
    const normalizedName = name.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();

    // Check for existing product in same category
    const existing = await Product.findOne({
      name: normalizedName,
      category: normalizedCategory,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This product already exists in this category.",
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      category: category.trim(),
      description,
      price,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product: newProduct,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
      error: error.message,
    });
  }
};
const updateProductsPrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.price = price;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product price updated successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating price",
      error: err.message,
    });
  }
};

const getFilteredProducts = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({
      success: true,
      message: "Filtered products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching filtered products",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Delete directly and get the deleted product in one step
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: err.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  addSalesman,
  getAllSalesman,
  getSalesman,
  updateSalesman,
  deleteSalesman,
  addSalesManager,
  getAllSalesManager,
  getSalesManager,
  updateSalesManager,
  deleteSalesManager,
  addSalesAuthorizer,
  getAllSalesAuthorizer,
  getSalesAuthorizer,
  updateSalesAuthorizer,
  deleteSalesAuthorizer,
  addPlantHead,
  getAllPlantHeads,
  getPlantHead,
  updatePlantHead,
  deletePlantHead,
  addAccountant,
  getAllAccountants,
  getAccountant,
  updateAccountant,
  deleteAccountant,
  addWarehouse,
  getAllWarehouse,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addProductToWarehouse,
  updateProductsPrice,
  deleteProduct,
  getAllProductsFromWarehouse,
  addProduct,
  getAllProducts,
  deleteProductsFromWarehouse,
  getFilteredProducts,
};
