// db.js

const { addDataToFirestore } = require('../firebase/functions');

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI not defined in .env");
}

let client;
let db;
let bookingCollection;

// Connect once and reuse the connection
async function connectToDatabase() {
  if (db) return db;

  client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();
    db = client.db("service_marketplace_db");
    bookingCollection = db.collection("bookings");
    console.log("✅ Connected to MongoDB");

    // Start watching for inserts
    watchBookings();

    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

function getBookingCollection() {
  if (!bookingCollection) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return bookingCollection;
}

// 🔁 Change Stream to watch inserts in "bookings"
function watchBookings() {
  const changeStream = bookingCollection.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const bookingData = change.fullDocument;
      console.log("📥 New booking inserted:");
      addDataToFirestore(bookingData)
    }
  });

  changeStream.on('error', (err) => {
    console.error("❗ Change stream error:", err);
  });

  console.log("👀 Watching for new inserts in 'bookings' collection...");
}

module.exports = {
  connectToDatabase,
  getBookingCollection,
};
