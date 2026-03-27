const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:DBpokaw@ac-mpuhdam-shard-00-00.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-01.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-02.5ugwtcq.mongodb.net:27017/stockManagerDB?ssl=true&authSource=admin';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db('stockManagerDB');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('app_data');

    if (req.method === 'GET') {
      const data = await collection.findOne({ _id: 'global_state' });
      return res.status(200).json(data || {});
    }

    if (req.method === 'POST') {
      const { stk, txs, bq, bm, prList } = req.body;
      await collection.updateOne(
        { _id: 'global_state' },
        { $set: { stk, txs, bq, bm, prList, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
