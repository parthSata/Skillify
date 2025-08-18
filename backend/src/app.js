import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js"; // Import new admin routes
import courseRouter from "./routes/course.routes.js"; // Import new course routes
import categoryRouter from "./routes/category.routes.js"; // Import new category routes
import tutorCourseRouter from "./routes/tutor.course.routes.js"; // Import new tutor course routes
import { ApiError } from "./utils/ApiError.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
// Admin routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/categories", categoryRouter);

// Tutor routes
app.use("/api/v1/tutor/courses", tutorCourseRouter); // Add the new tutor course route

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.VITE_NODE_ENV === "development" ? err.message : undefined,
  });
});

export { app, server };
