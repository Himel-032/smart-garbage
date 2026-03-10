import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import pool from "./db.js";

import authRoutes from './routes/auth.route.js';
import binRoutes from './routes/bins.routes.js';
import driverRoutes from './routes/drivers.route.js';
import messagesRoute from "./routes/messages.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173", // React dev server
//     credentials: true, // allow cookies to be sent
//   })
// );

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  }),
);
app.get('/', (req, res) => {
  res.send('Smart Garbage Management System Backend is running.');
});
app.use("/api/auth", authRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/drivers", driverRoutes)
app.use("/api/messages", messagesRoute);
app.use("/api/analytics", analyticsRoutes);

// ---------- Socket.IO Real-time Messaging ----------
const io = new Server(server, { cors: { origin: "*" } });

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if(!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded) return next(new Error("Unauthorized"));

    // Check driver (allow active, pending, or approved statuses)
    const driver = await pool.query("SELECT id, name FROM drivers WHERE id=$1 AND status IN ('active', 'pending', 'inactive')", [decoded.id]);
    if(driver.rows.length > 0) {
      socket.user = { ...driver.rows[0], role: "driver" };
      return next();
    }

    // Check admin
    const admin = await pool.query("SELECT id, name FROM admins WHERE id=$1", [decoded.id]);
    if(admin.rows.length > 0) {
      socket.user = { ...admin.rows[0], role: "admin" };
      return next();
    }

    return next(new Error("Unauthorized"));
  } catch (err) {
    console.error(err);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  socket.on("joinRoom", (room) => socket.join(room));

  socket.on("sendMessage", async (data) => {
    const { receiver_role, receiver_id, content } = data;
    const result = await pool.query(
      `INSERT INTO messages (sender_role, sender_id, receiver_role, receiver_id, content)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [socket.user.role, socket.user.id, receiver_role, receiver_id, content]
    );

    const savedMessage = result.rows[0];
    
    // Emit to both sender and receiver rooms
    const senderRoom = `${socket.user.role}_${socket.user.id}-${receiver_role}_${receiver_id}`;
    const receiverRoom = `${receiver_role}_${receiver_id}-${socket.user.role}_${socket.user.id}`;
    
    io.to(senderRoom).emit("newMessage", savedMessage);
    io.to(receiverRoom).emit("newMessage", savedMessage);
  });

  socket.on("disconnect", () => console.log(`${socket.user.name} disconnected`));
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});