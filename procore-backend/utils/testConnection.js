const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI; // MongoDB URI from .env
const client = new MongoClient(uri);

async function insertData() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("ProCore");
    const usersCollection = db.collection("users");

    // Example user data
    const userData = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password12345",
      role: "admin",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await usersCollection.insertOne(userData);
    console.log("Data inserted successfully:", result);
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.close();
  }
}

insertData();
