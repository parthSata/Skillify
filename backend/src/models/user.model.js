  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["admin", "tutor", "student"], required: true },
      avatar: { type: String },
      isApproved: { type: Boolean, default: false }, // For tutor approval
    },
    { timestamps: true }
  );

  export const User = mongoose.model("User", userSchema);
