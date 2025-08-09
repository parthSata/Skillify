import { User } from "../models/user.model.js";

const createInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "Admin1709@gmail.com" });
    if (existingAdmin) {
      return;
    }

    const adminUser = new User({
      name: "Admin",
      email: "Admin1709@gmail.com",
      password: "Password1709", // The pre-save hook will hash this
      role: "admin",
      isApproved: true,
    });

    await adminUser.save();
  } catch (error) {
    console.error("Error creating initial admin user:", error);
  }
};

export { createInitialAdmin };
