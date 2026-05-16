const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
  comment: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  designation: { type: String, default: "Customer" },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
