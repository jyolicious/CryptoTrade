const mongoose = require('mongoose');

const txSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy','sell'], required: true },
  symbol: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },   // per unit price at time of transaction (or total price)
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', txSchema);
