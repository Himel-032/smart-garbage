import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import binRoutes from './routes/bins.routes.js';
import driverRoutes from './routes/drivers.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true, // allow cookies to be sent
  })
);
app.get('/', (req, res) => {
  res.send('Smart Garbage Management System Backend is running.');
});
app.use("/api/auth", authRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/drivers", driverRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});