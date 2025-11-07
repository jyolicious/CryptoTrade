const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g., BTC
  name: { type: String },
  total: { type: Number, default: 0 },     // total supply in our DB
  available: { type: Number, default: 0 }  // available to buy
}, { timestamps: true });

module.exports = mongoose.model('Coin', coinSchema);
