// src/routes/payment.routes.js

import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPaymentAndEnroll,
} from "../controllers/payment.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles(["student"]));

router.route("/razorpay/order/:courseId").post(createRazorpayOrder);
router.route("/razorpay/verify").post(verifyPaymentAndEnroll);

export default router;
