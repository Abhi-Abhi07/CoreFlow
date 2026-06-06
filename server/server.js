// Application bootstrap file that wires middleware, routes, and global handlers.

import express from "express";
import "dotenv/config";
import cors from "cors";
import dns from "dns/promises";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from './config/database/db.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Setup DNS servers and trust proxy for rate limiter accuracy behind reverse proxies (like Vercel/Render)
dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.set('trust proxy', 1);

// Global Middleware
app.use(express.json());
app.use(helmet()); 

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",               // Local frontend development
  "https://core-flow-alpha.vercel.app"   // Production client deployment
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

// Rate Limiter for API endpoints
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 250,                 // Limit each IP to 250 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// API Routes
app.use("/api/v1/auth", authRoutes); // e.g., http://localhost:3000/api/v1/auth/register
app.use("/api/v1/user", userRoutes); 

// Fallback Handlers (Must be placed after all defined routes)
app.use(notFoundHandler); // Catches 404 routes
app.use(errorHandler);    // Custom global error handler framework

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at port : ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();