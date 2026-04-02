const mongoose = require('mongoose');

// MONGODB_URI (Update with your Atlas URI)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:DBpokaw@ac-mpuhdam-shard-00-00.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-01.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-02.5ugwtcq.mongodb.net:27017/stockManagerDB?ssl=true&authSource=admin';

// --- MODELS ---
const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  o: { type: Number, default: 0 }, // openingStock
  s: { type: String, default: '' }, // supplier
  p: { type: Number, default: 0 } // pricePerKg
});

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#555' },
  bom: { type: Map, of: Number }
});

const transactionSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  d: String, // date
  t: { type: String, enum: ['in', 'out'] }, // type
  i: String, // ingredient
  a: Number, // amount
  pr: String, // product
  b: String, // batch
  su: String, // supplier
  pc: String, // priceCode
  n: String // note
});

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Connection Helper
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await mongoose.connect(MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

// --- Vercel Serverless Handler ---
module.exports = async (req, res) => {
  await connectToDatabase();

  const { method, query } = req;

  // We can handle multiple collections by using a query param (e.g., /api/data?type=ingredients)
  const type = query.type || 'ingredients'; 

  try {
    switch (method) {
      case 'GET':
        if (type === 'ingredients') {
          const data = await Ingredient.find().sort({ name: 1 });
          return res.status(200).json(data);
        }
        if (type === 'products') {
          const data = await Product.find().sort({ name: 1 });
          return res.status(200).json(data);
        }
        if (type === 'transactions') {
          const data = await Transaction.find().sort({ id: -1 });
          return res.status(200).json(data);
        }
        break;

      case 'POST':
        if (type === 'transactions') {
          const newTx = new Transaction({ ...req.body, id: Date.now() });
          await newTx.save();
          return res.status(201).json(newTx);
        }
        if (type === 'ingredients') {
          const newIg = new Ingredient(req.body);
          await newIg.save();
          return res.status(201).json(newIg);
        }
        break;

      case 'PUT':
        if (type === 'ingredients') {
          const updated = await Ingredient.findOneAndUpdate({ name: query.name }, req.body, { new: true });
          return res.status(200).json(updated);
        }
        if (type === 'products') {
          const updated = await Product.findOneAndUpdate({ name: query.name }, req.body, { new: true });
          return res.status(200).json(updated);
        }
        break;

      case 'DELETE':
        if (type === 'transactions') {
          await Transaction.findOneAndDelete({ id: query.id });
          return res.status(200).json({ success: true });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
