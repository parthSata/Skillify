import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    isApproved: { type: Boolean, default: false },
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);