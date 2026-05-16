const Parcel = require("./parcel.model");
const TrackingEvent = require("./tracking.model");
const User = require("../users/user.model");
const createParcel = async (req, res, next) => {
  try {
    const senderId = req.user._id; // injected by protect middleware — never trust client

    const {
      receiverName, receiverPhone, deliveryAddress, district,
      parcelType, weight, instructions,
      // destination is used for cost calc
      destination,
    } = req.body;

    if (!receiverName || !receiverPhone || !deliveryAddress || !parcelType || !weight || !destination) {
      return res.status(400).json({ success: false, message: "Missing required booking fields." });
    }

    const kg = parseFloat(weight);
    if (isNaN(kg) || kg <= 0) {
      return res.status(400).json({ success: false, message: "Weight must be a positive number." });
    }

    // ── Server-side cost calculation (mirrors pricing.controller.js) ──
    const baseFareMap    = { document: 50, 'small-package': 80, 'medium-package': 120, 'large-package': 180, standard: 60, fragile: 100 };
    const destChargeMap  = { 'inside-city': 0, 'outside-city': 50, suburban: 80 };

    const baseFare       = baseFareMap[parcelType] ?? 60;
    const destCharge     = destChargeMap[destination] ?? 0;
    const weightCharge   = Math.ceil(Math.max(0, kg - 1)) * 20;
    const totalCost      = baseFare + destCharge + weightCharge;

    const trackingId = `ZS-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const parcel = await Parcel.create({
      trackingId,
      sender: senderId,
      receiver: {
        name: receiverName,
        phone: receiverPhone,
        address: deliveryAddress,
        district: district || "N/A",
      },
      type: parcelType.charAt(0).toUpperCase() + parcelType.slice(1).replace(/-/g, ' '),
      weight: kg,
      deliveryCharge: totalCost,
      instructions: instructions || "",
    });

    await TrackingEvent.create({
      parcelId: parcel._id,
      status: "pending",
      location: "Sender Location",
      note: "Parcel booking request received successfully.",
    });

    res.status(201).json({
      success: true,
      message: "Parcel booked successfully!",
      data: { parcel, trackingId, totalCost },
    });
  } catch (error) {
    next(error);
  }
};

const trackParcel = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const parcel = await Parcel.findOne({ trackingId }).populate("sender", "name email");
    if (!parcel) {
      return res
        .status(404)
        .json({ success: false, message: "Parcel not found with this tracking ID" });
    }

    const history = await TrackingEvent.find({ parcelId: parcel._id }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      parcel,
      trackingHistory: history,
    });
  } catch (error) {
    next(error);
  }
};

const updateParcelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, note } = req.body;

    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    parcel.status = status;
    if (location) parcel.currentWarehouse = location;
    await parcel.save();
    const newEvent = await TrackingEvent.create({
      parcelId: parcel._id,
      status,
      location: location || parcel.currentWarehouse,
      note: note || `Parcel status updated to ${status}`,
    });

    res.status(200).json({
      success: true,
      message: `Parcel status updated to ${status}`,
      parcel,
      newEvent,
    });
  } catch (error) {
    next(error);
  }
};

const assignRiderToParcel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;
    const rider = await User.findOne({ _id: riderId, role: "rider" });
    if (!rider) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Rider ID or user is not a rider" });
    }

    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    parcel.assignedRider = riderId;
    parcel.status = "accepted";
    await parcel.save();

    await TrackingEvent.create({
      parcelId: parcel._id,
      status: "accepted",
      location: parcel.currentWarehouse,
      note: `Parcel accepted by admin and assigned to rider: ${rider.name}`,
    });

    res.status(200).json({
      success: true,
      message: `Rider ${rider.name} successfully assigned to this parcel!`,
      parcel,
    });
  } catch (error) {
    next(error);
  }
};
const getAdminStats = async (req, res, next) => {
  try {
    const totalParcels = await Parcel.countDocuments();
    const pendingParcels = await Parcel.countDocuments({ status: "pending" });
    const deliveredParcels = await Parcel.countDocuments({ status: "delivered" });

    const revenueAggregation = await Parcel.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalEarnings: { $sum: "$deliveryCharge" } } },
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalEarnings : 0;
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalParcels,
        pendingParcels,
        deliveredParcels,
        totalRevenue,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getMyBookings = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ sender: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: parcels.length, parcels });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createParcel,
  trackParcel,
  updateParcelStatus,
  assignRiderToParcel,
  getAdminStats,
  getMyBookings,
};
