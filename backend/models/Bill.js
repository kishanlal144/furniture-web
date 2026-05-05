const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  items: [{
    catalogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' },
    catalogName: { type: String },
    length: { type: Number },
    width: { type: Number },
    sqFt: { type: Number },
    rate: { type: Number },
    price: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', BillSchema);
