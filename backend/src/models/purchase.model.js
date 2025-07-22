import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model("Purchase", purchaseSchema);
