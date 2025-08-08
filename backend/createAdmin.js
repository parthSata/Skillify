import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

// Replace with your actual MongoDB URI
const MONGODB_URI = process.env.VITE_MONGODB_URI;
console.log("🚀 ~ MONGODB_URI:", MONGODB_URI);

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "Admin1709@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const adminUser = new User({
      name: "Admin",
      email: "Admin1709@gmail.com",
      password: "Password1709",
      role: "admin",
      isApproved: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
