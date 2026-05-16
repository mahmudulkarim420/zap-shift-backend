const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema({
  parcelId: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel", required: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrackingEvent", trackingEventSchema);
