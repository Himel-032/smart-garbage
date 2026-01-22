import pool from "../db.js";

export const getAllDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM drivers ORDER BY name ASC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};