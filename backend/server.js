require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
const txRoutes = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/transactions', txRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log('Server running on', process.env.PORT||5000));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
