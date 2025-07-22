import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    duration: { type: String },
    resources: [{ type: String }], // Optional files like PDF, DOC
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
