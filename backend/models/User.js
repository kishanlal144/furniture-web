const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, default: 'My Company' },
  companyTagline: { type: String, default: 'Quality Furniture' },
  companyPhone: { type: String, default: '' },
  companyAddress: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
