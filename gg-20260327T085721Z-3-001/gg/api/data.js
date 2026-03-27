import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://admin:DBpokaw@ac-mpuhdam-shard-00-00.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-01.5ugwtcq.mongodb.net:27017,ac-mpuhdam-shard-00-02.5ugwtcq.mongodb.net:27017/stockManagerDB?ssl=true&authSource=admin';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGO_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('stockManagerDB');
    const col = db.collection('app_data');

    if (req.method === 'GET') {
      const data = await col.findOne({ _id: 'global_state' });
      return res.status(200).json(data || {});
    }

    if (req.method === 'POST') {
      const payload = req.body;
      const update = {};
      if (payload.stk) update.stk = payload.stk;
      if (payload.txs) update.txs = payload.txs;
      if (payload.bq) update.bq = payload.bq;
      if (payload.bm) update.bm = payload.bm;
      if (payload.prList) update.prList = payload.prList;

      await col.updateOne(
        { _id: 'global_state' },
        { $set: update },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
