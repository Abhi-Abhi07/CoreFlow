import { User } from "../models/userModel.js";
import {cloudinary} from "../utils/cloudinary.js";


export const allUser = async (_, res) => {
  try {
    // Exclude the password and internal OTP data from the response
    const users = await User.find().select("-password -otp -otpExpiry -token");
    
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Fetch Users Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fixed projection string syntax (space-separated instead of comma-separated)
    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry -token"
    );

    if (!user) {
      return res.status(404).json({ // 404: Standard response for missing resource
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User By ID Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInUser = req.user;

    const { 
      firstName, 
      lastName, 
      phoneNo, 
      role,
      street, 
      city, 
      state, 
      zipCode 
    } = req.body;

    // 1. Authorization Check
    if (
      loggedInUser._id.toString() !== userIdToUpdate &&
      loggedInUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this profile",
      });
    }

    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Profile Picture Upload using Cloudinary
    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    if (req.file) {
      if (profilePicPublicId) {
        const result = await cloudinary.uploader.destroy(profilePicPublicId);
        console.log("Cloudinary Delete Result:", result);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error details: ", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    // 3. Update Fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNo = phoneNo || user.phoneNo;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;

    // 4. Role Update Security: Only allow admins to change roles
    if (loggedInUser.role === "admin" && role) {
      user.role = role;
    }

    // 5. Align with nested address schema
    if (!user.addressInfo) user.addressInfo = {};
    user.addressInfo.street = street || user.addressInfo.street;
    user.addressInfo.city = city || user.addressInfo.city;
    user.addressInfo.state = state || user.addressInfo.state;
    user.addressInfo.zipCode = zipCode || user.addressInfo.zipCode;

    const updatedUser = await user.save();

    // 6. Exclude password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};