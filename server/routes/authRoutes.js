import express from "express";
import { changePassword, forgotPassword, login, logout, register, reVerify, verify, verifyOTP } from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication and Verification Endpoints
router.post("/register", register);
router.post("/verify", verify);
router.post("/re-verify", reVerify);
router.post("/login", login);
router.post("/logout", isAuthenticated,logout);

// Password Management Endpoints
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

export default router; 