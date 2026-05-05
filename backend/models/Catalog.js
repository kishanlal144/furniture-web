const mongoose = require('mongoose');

const CatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ratePerSqFt: { type: Number, required: true },
});

module.exports = mongoose.model('Catalog', CatalogSchema);
