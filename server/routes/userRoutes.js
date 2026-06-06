import express from "express";
import { allUser, getUserById, updateUser } from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.get("/all-user",isAuthenticated,isAdmin,allUser)
router.get("/get-user/:userId",getUserById)
router.put("/update/:id",isAuthenticated,singleUpload,updateUser)

export default router; 
 