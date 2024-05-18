const mongoose = require("mongoose");
require('dotenv').config();

const mongoURI =process.env.MONGO_URI

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error in connecting to database:", err);
  }
};

module.exports = connectToMongo;
