const RiderProfile = require("./rider.model");
const User = require("../users/user.model");
const Parcel = require("../parcels/parcel.model");

const applyToBeRider = async (req, res, next) => {
  try {
    const { userId, age, nid, phone, preferredWarehouse } = req.body;

    if (!userId || !age || !nid || !phone || !preferredWarehouse) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingProfile = await RiderProfile.findOne({ $or: [{ userId }, { nid }] });
    if (existingProfile) {
      return res
        .status(400)
        .json({ success: false, message: "Application already exists for this User or NID" });
    }

    const application = await RiderProfile.create({
      userId,
      age,
      nid,
      phone,
      preferredWarehouse,
    });

    res.status(200).json({
      success: true,
      message: "Rider application submitted successfully! Waiting for admin approval.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

const getRiderApplications = async (req, res, next) => {
  try {
    const applications = await RiderProfile.find().populate("userId", "name email role");
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

const approveRider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await RiderProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Rider profile not found" });
    }

    profile.status = "approved";
    await profile.save();

    await User.findByIdAndUpdate(profile.userId, { role: "rider" });

    res.status(200).json({
      success: true,
      message: "Rider approved successfully and role updated to rider!",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const getRiderTasks = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const tasks = await Parcel.find({
      assignedRider: riderId,
      status: { $in: ["accepted", "in_transit", "out_for_delivery"] },
    });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToBeRider,
  getRiderApplications,
  approveRider,
  getRiderTasks,
};
