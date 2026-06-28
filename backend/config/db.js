import mongoose from "mongoose";

const connectDB = async () => {


  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to server/.env");
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully!");
};

export default connectDB;
