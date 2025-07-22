import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number },
    method: { type: String }, // e.g. "razorpay"
    status: { type: String, enum: ["success", "failed", "pending"] },
    details: { type: Object }, // raw response or metadata
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
