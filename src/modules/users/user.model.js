const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'rider', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
  image: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
  phone: { type: String, default: "" },
  nid: { type: String, default: "" },
  age: { type: Number, default: null },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  earnings: { type: Number, default: 0 },
  deliveriesCompleted: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);