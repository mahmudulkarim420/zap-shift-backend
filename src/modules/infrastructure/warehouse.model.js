const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  coveredAreas: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);