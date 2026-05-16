const mongoose = require("mongoose");

const riderProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, required: true },
    nid: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    preferredWarehouse: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "suspended"], default: "pending" },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RiderProfile", riderProfileSchema);
