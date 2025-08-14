// Import Mongoose for MongoDB interaction
import mongoose from 'mongoose';

// Import dotenv to load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config(); // Initialize dotenv

// Check if MONGODB_URI is provided in environment variables
if (!process.env.MONGODB_URI) {
  throw new Error("Please provide MONGODB_URI in the .env file");
}

// Async function to connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Connect using URI
    console.log("connect DB"); // Log success
  } catch (error) {
    console.log("Mongodb connect error", error); // Log error
    process.exit(1); // Exit process on failure
  }
}

// Export the connectDB function for use in other modules
export default connectDB;