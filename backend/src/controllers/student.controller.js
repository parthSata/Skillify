import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";

// A mock progress tracking mechanism for demonstration
const mockProgress = (courseId, studentId) => {
  const hash = (courseId + studentId)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const progress = (hash % 100) + 1; // Generates a number from 1 to 100
  const isCompleted = progress > 90;
  const nextLesson = isCompleted
    ? "No more lessons"
    : `Lesson ${Math.floor(progress / 10) + 1}`;
  return {
    progress,
    nextLesson,
    status: isCompleted ? "completed" : "in-progress",
  };
};

const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  if (!studentId) {
    throw new ApiError(401, "User not authenticated.");
  }

  const student = await User.findById(studentId).populate({
    path: "enrolledCourses",
    model: "Course",
    select: "title thumbnail",
  });

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const myCourses = student.enrolledCourses.map((course) => {
    const progressData = mockProgress(
      course._id.toString(),
      studentId.toString()
    );
    return {
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      progress: progressData.progress,
      nextLesson: progressData.nextLesson,
      status: progressData.status,
    };
  });

  const completedCourses = myCourses.filter(
    (course) => course.status === "completed"
  ).length;

  const stats = {
    totalEnrolledCourses: myCourses.length,
    completedCourses: completedCourses,
    coursesInProgress: myCourses.length - completedCourses,
    totalCertificates: completedCourses,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        myCourses,
      },
      "Student dashboard data fetched successfully."
    )
  );
});

export { getStudentDashboard };
