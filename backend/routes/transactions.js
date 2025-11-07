const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Coin = require('../models/Coin');
const Transaction = require('../models/Transaction');

// List transactions for current user
router.get('/', auth, async (req, res) => {
  const txs = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(txs);
});

// Buy endpoint
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, amount, price } = req.body;
    if(!symbol || !amount || !price) return res.status(400).json({ message: 'Missing fields' });
    const qty = Number(amount);
    if(qty <= 0) return res.status(400).json({ message: 'Amount must be > 0' });

    // Atomically decrement available if enough
    const coin = await Coin.findOneAndUpdate(
      { symbol: symbol.toUpperCase(), available: { $gte: qty } },
      { $inc: { available: -qty } },
      { new: true }
    );

    if(!coin) return res.status(400).json({ message: 'Insufficient coins available' });

    // Create transaction
    const tx = new Transaction({
      user: req.user.id,
      type: 'buy',
      symbol: symbol.toUpperCase(),
      amount: qty,
      price: Number(price)
    });
    await tx.save();

    res.json({ message: 'Bought', coin, tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sell endpoint
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, amount, price } = req.body;
    if(!symbol || !amount || !price) return res.status(400).json({ message: 'Missing fields' });
    const qty = Number(amount);
    if(qty <= 0) return res.status(400).json({ message: 'Amount must be > 0' });

    // Atomically increment available (we assume the user actually owns the coin — for demo we skip ownership check)
    const coin = await Coin.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      { $inc: { available: qty } },
      { new: true }
    );

    if(!coin) return res.status(404).json({ message: 'Coin not found' });

    const tx = new Transaction({
      user: req.user.id,
      type: 'sell',
      symbol: symbol.toUpperCase(),
      amount: qty,
      price: Number(price)
    });
    await tx.save();

    res.json({ message: 'Sold', coin, tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
