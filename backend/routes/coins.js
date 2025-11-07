const express = require('express');
const Coin = require('../models/Coin');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get all coins
router.get('/', async (req, res) => {
  const coins = await Coin.find();
  res.json(coins);
});

// Get single coin
router.get('/:symbol', async (req, res) => {
  const coin = await Coin.findOne({ symbol: req.params.symbol.toUpperCase() });
  if(!coin) return res.status(404).json({ message: 'Not found' });
  res.json(coin);
});

// Admin-ish: create/seed a coin (you can use Postman)
// protect if needed:
router.post('/', authMiddleware, async (req, res) => {
  const { symbol, name, total, available } = req.body;
  try {
    const coin = new Coin({ symbol: symbol.toUpperCase(), name, total, available });
    await coin.save();
    res.status(201).json(coin);
  } catch (err) { console.error(err); res.status(400).json({ message: 'Error' }); }
});

module.exports = router;
