import express from 'express'
import 'dotenv/config.js'
import connectDB from './config/database/db.js';
import dns from 'dns'
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

dns.setServers(['1.1.1.1','8.8.8.8'])

// middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))

app.use("/api/v1/auth",authRoutes) // http://localhost:8000/api/v1/auth/register
app.use("/api/v1/user",userRoutes) 

app.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port : ${PORT}`);
})