const Party = require("../models/Party");
const sendNotificationToRole = require("../sendNotification");
const Admin = require("../models/Admin");
const Salesman = require("../models/Salesman");

const addParty = async (req, res) => {
  try {
    const salesmanId = req.user.id;
    const { companyName, contactPersonNumber, address, limit, subAgents } =
      req.body;

    const party = new Party({
      companyName,
      contactPersonNumber,
      address,
      limit,
      subAgents,
      addedBy: salesmanId,
    });

    const salesman = await Salesman.findById(salesmanId);

    const admins = await Admin.find().select("_id");
    const adminIds = admins.map((u) => u._id.toString());

    await party.save();

    const payload = {
      title: "New party added",
      message: `New party ${party.companyName} added by ${salesman?.name}`,
      type: "partyAdded",
      senderId: salesmanId,
      receiverId: adminIds,
      read: false,
      orderId: party._id,
    };

    const sendToRoles = ["Admin"];

    await sendNotificationToRole(sendToRoles, payload);

    res.status(201).json({
      success: true,
      message: "Party added successfully",
      data: party,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while adding party",
      error: err.message,
    });
  }
};

const updateParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    const { companyName, contactPersonNumber, address, limit } = req.body;

    const party = await Party.findByIdAndUpdate(partyId, {
      companyName,
      contactPersonNumber,
      address,
      limit,
    });
    if (!party)
      return res.json({
        message: "Party not found",
        success: false,
      });
    return res.json({
      message: "Party updated successfully",
      success: true,
      data: party,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const deleteParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    const party = await Party.findByIdAndDelete(partyId);
    if (!party)
      return res.json({
        message: "Party not found",
        success: false,
      });
    return res.json({
      message: "Party deleted successfully",
      success: true,
      data: party,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const sendPartyForApproval = async (req, res) => {
  try {
    const salesmanId = req.user.id;
    const { partyId } = req.body;


    const party = await Party.findOne({ _id: partyId, addedBy: salesmanId });
    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    if (party.approvedBy && party.partyStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Party already approved",
      });
    } else {
      party.partyStatus = "sentForApproval";

      const salesman = await Salesman.findById(salesmanId);

      const admins = await Admin.find().select("_id");
      const adminIds = admins.map((u) => u._id.toString());

      await party.save();

      const payload = {
        title: "Check Party Approval",
        message: `Party ${party.companyName} sent for approval by ${salesman?.name}, Check it out`,
        type: "partySentForApproval",
        senderId: salesmanId,
        receiverId: adminIds,
        read: false,
        orderId: party._id,
      };

      const sendToRoles = ["Admin"];

      await sendNotificationToRole(sendToRoles, payload);
    }

    res.status(200).json({
      success: true,
      message: "Party sent for approval to admin",
      data: party,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send party for approval",
      error: err.message,
    });
  }
};

const approveParty = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { partyId } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    if (party.approvedBy && party.partyStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Party already approved",
      });
    } else {
      party.partyStatus = "approved";
      party.approved = true;
      party.approvedBy = adminId;
    }

    await party.save();

    const admin = await Admin.findById(adminId);
    const salesman = await Salesman.findById(party.addedBy).select("_id");


    const payload = {
      title: "Party Approved",
      message: `Party ${party.companyName} has been approved by ${admin?.name}`,
      type: "partyApproved",
      senderId: admin._id.toString(),
      receiverId: salesman._id.toString(),
      read: false,
      orderId: party._id,
    };

    const sendToRoles = ["Salesman"];

    await sendNotificationToRole(sendToRoles, payload);

    res.status(200).json({
      success: true,
      message: "Party approved successfully",
      data: party,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to approve party",
      error: err.message,
    });
  }
};

const rejectPartyApproval = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { partyId } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    party.partyStatus = "rejected";
    party.approved = false;
    party.rejectedBy = adminId;

    await party.save();

    res.status(200).json({
      success: true,
      message: "Approval rejected successfully",
      data: party,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reject party",
      error: err.message,
    });
  }
};

const getPartiesToApprove = async (req, res) => {
  try {
    const party = await Party.find({
      partyStatus: "sentForApproval",
    });
    if (!party)
      return res
        .status(404)
        .json({ message: "Parties not found", success: false });

    return res.status(200).json({
      message: "Parties fetched successfully",
      success: true,
      data: party,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json({
      success: true,
      message: "All parties fetched successfully",
      data: parties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching parties",
      error: err.message,
    });
  }
};

//only admin can see them
const getAllPartiesForAdmin = async (req, res) => {
  try {
    const parties = await Party.find({
      partyStatus: { $in: ["sentForApproval", "rejected", "approved"] },
    });

    res.status(200).json({
      success: true,
      message: "All parties fetched successfully",
      data: parties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching parties",
      error: err.message,
    });
  }
};

const getApprovedParties = async (req, res) => {
  try {
    const parties = await Party.find({
      approved: true,
      partyStatus: "approved",
    });
    res.status(200).json({
      success: true,
      message: "All parties fetched successfully",
      data: parties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching parties",
      error: err.message,
    });
  }
};

const getRejectedParties = async (req, res) => {
  try {
    const parties = await Party.find({
      approved: false,
      partyStatus: "rejected",
    });
    res.status(200).json({
      success: true,
      message: "All rejected parties fetched successfully",
      data: parties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching rejected parties",
      error: err.message,
    });
  }
};

const getRejectedPartiesForAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;

    const parties = await Party.find({
      approved: false,
      partyStatus: "rejected",
      rejectedBy: adminId,
    });
    res.status(200).json({
      success: true,
      message: "All rejected parties fetched successfully",
      data: parties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching rejected parties",
      error: err.message,
    });
  }
};

module.exports = {
  getAllParties,
  getApprovedParties,
  addParty,
  sendPartyForApproval,
  approveParty,
  updateParty,
  deleteParty,
  getPartiesToApprove,
  getAllPartiesForAdmin,
  rejectPartyApproval,
  getRejectedPartiesForAdmin,
  getRejectedParties,
};
