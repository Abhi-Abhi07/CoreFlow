import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { verifyEmail } from "../utils/emailUtils.js";
import { Session } from '../models/sessionModel.js'
import { sendOTPMail } from "../utils/emailUtils.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // 400: Missing required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const user = await User.findOne({ email });
    // 400: Resource conflict (User already exists)
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    try {
      await verifyEmail(token, email);
    } catch (mailError) {
      console.error("Verification email failed:", mailError.message);
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        success: false,
        message: "Unable to send verification email. Please try again later.",
      });
    }

    newUser.token = token;
    await newUser.save();
    
    // Exclude password from the response payload for security
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // 201: Successfully created a resource
    return res.status(201).json({
      success: true,
      message: "User registered successfully! Please verify your email.",
      user: userResponse,
    });
    
  } catch (error) {
    // 500: Server error
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ // 401 for expired authentication tokens
          success: false,
          message: "The registration token has expired. Please request a new verification link.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }
``
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ // 404: Resource not found instead of 400
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is already verified to avoid unnecessary DB updates
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "User is already verified",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verification successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reVerify = async (req, res) => {
  try {
    let email = req.body.email;

    // Optional: If email isn't in body, try to get it from the expired token
    if (!email && req.headers.authorization) {
      const expiredToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.decode(expiredToken); // decode() doesn't throw on expiration
      if (decoded && decoded.id) {
        const userById = await User.findById(decoded.id);
        email = userById?.email;
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }

    // Generate new token
    const newToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10m" });

    // Send the email (ensure verifyEmail is correctly imported and configured)
    await verifyEmail(newToken, user.email);

    user.token = newToken; // Update stored token
    await user.save();

    return res.status(200).json({
      success: true,
      message: "A fresh verification link has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify your account then login",
      });
    }

    // Tokens generated
    const accessToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
    );
    const refreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }, 
    );

    // Update user state
    existingUser.isLoggedIn = true;
    await existingUser.save();

    // Check for existing session and delete it
    await Session.deleteMany({ userId: existingUser._id });

    // Create a new Session
    await Session.create({ userId: existingUser._id });

    // Exclude password from the response
    const userResponse = existingUser.toObject();
    delete userResponse.password;

    // Optional: Set HTTP-only secure cookie for the refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back ${existingUser.firstName}`,
      user: userResponse,
      accessToken,
      // refreshToken can be sent in response or cookie depending on architecture
      refreshToken, 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.id || (req.user && req.user._id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user session",
      });
    }

    // Delete related sessions
    await Session.deleteMany({ userId: userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    // Clear authentication cookies if used
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    
    // Security improvement: Prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists in our system, an OTP has been sent.",
      });
    }

    // Generate 6 digit numeric string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // add 10 min

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    
    await user.save();
    await sendOTPMail(otp, email);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params; // Destructure email from params cleanly

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ // 404 Not Found is more standard
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP is not generated or already verified",
      });
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }

    // Clear the OTP fields
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params; // Make sure your route has /change-password/:email

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ // 404 Not Found is more standard
        success: false,
        message: "User not found",
      });
    }

    // Optional: Add a minimum length constraint
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Security improvement: Terminate active sessions on other devices when password changes
    await Session.deleteMany({ userId: user._id });
    user.isLoggedIn = false; // Update login status
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change Password Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};