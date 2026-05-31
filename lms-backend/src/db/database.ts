import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/lms_backend";
    const connectionInstance = await mongoose.connect(uri);
    console.log(`MongoDB connected! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
