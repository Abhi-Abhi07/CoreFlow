// Application bootstrap file that wires middleware, routes, and global handlers.

import express from "express";
import "dotenv/config";
import cors from "cors";
import dns from "dns/promises";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from './config/database/db.js';
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.set('trust proxy', 1);

// middleware
app.use(express.json());
app.use(helmet()); 

// middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",          // For local development
  "https://coreflow-3k0f.onrender.com" , // for production client
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Keep this true since you are using withCredentials on frontend
}));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use("/api/v1/auth",authRoutes) // http://localhost:8000/api/v1/auth/register
app.use("/api/v1/user",userRoutes) 

// app.listen(PORT,()=>{
//     connectDB();
//     console.log(`server running at port : ${PORT}`);
// })

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server running at port : ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();