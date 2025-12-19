
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

let client = null;
let _db = null;

async function connect() {
  if (_db) return _db;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  _db = client.db('myDB');
  return _db;
}

function getDb() {
  if (!_db) throw new Error('Database not initialized. Call connect() first.');
  return _db;
}

module.exports = { connect, getDb };
