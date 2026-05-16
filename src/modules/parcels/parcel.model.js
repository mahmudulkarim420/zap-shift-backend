const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      district: { type: String, required: true },
    },
    type: {
      type: String,
      enum: ["Standard", "Fragile", "Document", "Liquid"],
      default: "Standard",
    },
    weight: { type: Number, required: true }, 
    deliveryCharge: { type: Number, required: true },
    codAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    currentWarehouse: { type: String, default: "Central Hub" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Parcel", parcelSchema);
