import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    const maskedUri = (process.env.DATABASE_URI || "").replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
    console.log(`Database Connected at ${maskedUri || "mongodb"}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;