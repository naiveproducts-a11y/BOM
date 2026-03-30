const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Ingredient, Product, Transaction } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:DBpokaw@ac-mpuhdam-shard-00-00.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-01.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-02.5ugwtcq.mongodb.net:27017/stockManagerDB?ssl=true&authSource=admin';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serve static index.html if needed (optional)
app.use(express.static('./'));

// --- ROUTES ---

// Ingredients
app.get('/api/ingredients', async (req, res) => {
  try {
    const list = await Ingredient.find().sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const list = await Product.find().sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ingredients - Add new
app.post('/api/ingredients', async (req, res) => {
  try {
    const newIg = new Ingredient(req.body);
    await newIg.save();
    res.status(201).json(newIg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ingredients - Update
app.put('/api/ingredients/:name', async (req, res) => {
  try {
    const updated = await Ingredient.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Products - Update BOM
app.put('/api/products/:name', async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Transactions - List
app.get('/api/transactions', async (req, res) => {
  try {
    const list = await Transaction.find().sort({ id: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transactions - Add
app.post('/api/transactions', async (req, res) => {
  try {
    const newTx = new Transaction({
      ...req.body,
      id: Date.now() // Use timestamp for unique id to match client logic
    });
    await newTx.save();
    res.status(201).json(newTx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Transactions - Delete
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Production Calculation Help?
// In index.html, the BOMs are part of products.
// We can expose the products specifically for this.

// --- CONNECT & START ---
// For Vercel/Serverless: We connect and export the app
// The connection is cached by Mongoose if defined outside the handler
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

module.exports = app;
