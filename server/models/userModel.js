import mongoose from "mongoose";

// Sub-schema for user shipping/billing details
const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true, default: "India" }
}, { _id: false }); // Avoid generating object IDs for the sub-document

const userSchema = new mongoose.Schema({
  // Name Fields
  firstName: { 
    type: String, 
    required: [true, "First name is required"], 
    trim: true, 
    maxlength: 50 
  },
  lastName: { 
    type: String, 
    required: [true, "Last name is required"], 
    trim: true, 
    maxlength: 50 
  },
  
  // Authentication & Credentials
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"], 
    minlength: 6 
  },
  
  // Profile Picture (Cloudinary Storage)
  profilePic: { 
    type: String, 
    default: "" 
  },
  profilePicPublicId: { 
    type: String, 
    default: "" 
  },

  // Role Management
  role: {
    type: String, 
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not supported'
    },
    default: 'user'
  },
  
  // Account Status Flags
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isLoggedIn: { 
    type: Boolean, 
    default: false 
  },
  
  // Security Tokens & OTP
  token: { 
    type: String, 
    default: null 
  },
  otp: { 
    type: String, 
    default: null 
  },
  otpExpiry: { 
    type: Date, 
    default: null 
  },
  
  // Contact Information
  phoneNo: { 
    type: String, 
    trim: true 
  },

  // Address sub-document
  addressInfo: {
    type: addressSchema,
    default: () => ({})
  }

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);