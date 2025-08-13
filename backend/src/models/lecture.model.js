import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    duration: { type: String },
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
