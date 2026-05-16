const User = require("../users/user.model");
const Parcel = require("../parcels/parcel.model");

// GET /admin/dashboard-stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRiders,
      activeDeliveries,
      pendingApprovals,
      completedDeliveries,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "rider", status: "active" }),
      Parcel.countDocuments({ status: { $in: ["accepted", "in_transit", "out_for_delivery"] } }),
      User.countDocuments({ role: "rider", status: "pending" }),
      Parcel.countDocuments({ status: "delivered" }),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalRiders, activeDeliveries, pendingApprovals, completedDeliveries },
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/riders/pending
const getPendingRiders = async (req, res, next) => {
  try {
    const riders = await User.find({ role: "rider", status: "pending" })
      .select("-password")
      .populate("warehouseId", "name area city")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: riders.length, data: riders });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/riders/approve/:id
const approveRider = async (req, res, next) => {
  try {
    const rider = await User.findOneAndUpdate(
      { _id: req.params.id, role: "rider", status: "pending" },
      { status: "active" },
      { new: true }
    ).select("-password");

    if (!rider) {
      return res.status(404).json({ success: false, message: "Pending rider not found." });
    }

    res.status(200).json({
      success: true,
      message: `Rider ${rider.name} approved successfully!`,
      data: rider,
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/users  — all users (for management table)
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select("-password")
      .populate("warehouseId", "name area city")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/users/:id/role-status — combined update
const updateUserRoleStatus = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const updateData = {};
    
    if (role && ["user", "rider", "admin"].includes(role)) {
      updateData.role = role;
    }
    if (status && ["active", "suspended", "pending"].includes(status)) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid update fields provided." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User updated successfully.", data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/users/:id/role — update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "rider", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role value." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User role updated.", data: user });
  } catch (error) {
    next(error);
  }
};

// GET /admin/riders — specific rider directory
const getAllRiders = async (req, res, next) => {
  try {
    const riders = await User.find({ role: "rider" })
      .select("-password")
      .populate("warehouseId", "name area")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: riders.length, data: riders });
  } catch (error) {
    next(error);
  }
};

// GET /admin/parcels
const getAllParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({})
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, count: parcels.length, data: parcels });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPendingRiders,
  approveRider,
  getAllUsers,
  updateUserRoleStatus,
  updateUserRole, // Keeping for backward compatibility if needed
  getAllRiders,
  getAllParcels,
};
