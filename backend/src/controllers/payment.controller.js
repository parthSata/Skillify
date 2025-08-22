// src/controllers/payment.controller.js
import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";

// DO NOT create the instance at the global level
// const razorpayInstance = new Razorpay({...});

// Create an order for a course
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const student = req.user; // Initialize Razorpay instance inside the function

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("🚀 ~ razorpayInstance:", razorpayInstance);

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  if (student.enrolledCourses.includes(courseId)) {
    throw new ApiError(400, "Student is already enrolled in this course.");
  } // FIX: Round the amount to ensure it is a valid integer

  const amount = Math.round(course.price * 100); // FIX: Generate a shorter receipt string to avoid length error

  const receipt = `rcpt_${student._id.toString().substring(0, 8)}_${courseId.substring(0, 8)}`;

  const options = {
    amount: amount,
    currency: "INR",
    receipt: receipt,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log("🚀 ~ order:", order);

    if (!order || !order.id) {
      throw new ApiError(500, "Failed to create Razorpay order.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, order, "Order created successfully."));
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new ApiError(
      500,
      "Failed to initiate payment. Please try again later."
    );
  }
});

// Verify payment and enroll the student
export const verifyPaymentAndEnroll = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
  } = req.body;
  const studentId = req.user._id;

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    studentId,
    { $addToSet: { enrolledCourses: courseId } },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Failed to enroll student.");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        courseId: courseId,
        razorpay_payment_id,
      },
      "Payment successful and student enrolled."
    )
  );
});
