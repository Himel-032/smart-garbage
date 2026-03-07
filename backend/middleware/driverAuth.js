import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

export const authenticateDriver = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header missing or malformed" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    // Optional: fetch driver from database (more secure)
    const result = await pool.query(
      "SELECT id, name, email FROM drivers WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Driver not found" });
    }

    req.driver = result.rows[0]; // attach driver object
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
