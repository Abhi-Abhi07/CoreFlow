import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ // Changed status code to 401
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
        return res.status(401).json({
          success: false,
          message: "The access token has expired. Please refresh your session.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Access Token is missing or invalid",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ // Changed to 404 Not Found
        success: false,
        message: "User not found",
      });
    }

    // Attach user object and ID to the request object
    req.user = user;
    req.id = user._id;

    next(); // Pass control to the next middleware or controller
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const isAdmin = (req, res, next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        return res.status(403).json({
            message: "Access denied: Admins only"
        })
    }
}