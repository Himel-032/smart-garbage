import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const addBin = async (req, res) => {
  try {
    const { name, location, driver_id, capacity, latitude, longitude } =
      req.body;
    const driverIdValue = driver_id !== undefined ? parseInt(driver_id) : null;
    const capacityValue = capacity !== undefined ? parseInt(capacity) : 100;
    const latitudeValue = latitude !== undefined ? parseFloat(latitude) : null;
    const longitudeValue =
      longitude !== undefined ? parseFloat(longitude) : null;
    const result = await pool.query(
      `INSERT INTO bins (name, location, driver_id, capacity, latitude, longitude) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        location,
        driverIdValue,
        capacityValue,
        latitudeValue,
        longitudeValue,
      ],
    );

    res.status(201).json({ success: true, bin: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, d.name AS driver_name
       FROM bins b
       LEFT JOIN drivers d ON b.driver_id = d.id
       ORDER BY b.id ASC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBinById = async (req, res) => {
  const { id } = req.params;
  const binId = parseInt(id);

  if (isNaN(binId)) {
    return res.status(400).json({ message: "Invalid bin ID" });
  }

  try {
    const { rows } = await pool.query("SELECT * FROM bins WHERE id = $1", [binId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Bin not found" });
    }

    res.json({ bin: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBin = async (req, res) => {
  const { id } = req.params;
  const binId = parseInt(id);

  if (isNaN(binId)) {
    return res.status(400).json({ message: "Invalid bin ID" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM bins WHERE id = $1 RETURNING *",
      [binId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Bin not found" });
    }

    res.json({ message: "Bin deleted successfully", bin: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBin = async (req, res) => {
  const { id } = req.params;
  const binId = parseInt(id);

  if (isNaN(binId)) {
    return res.status(400).json({ message: "Invalid bin ID" });
  }

  const {
    name,
    location,
    driver_id,
    capacity,
    current_level,
    status,
    latitude,
    longitude,
  } = req.body;

  try {
    // First, fetch the current bin
    const { rows } = await pool.query("SELECT * FROM bins WHERE id = $1", [
      binId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Bin not found" });
    }

    const bin = rows[0];
    // Parse numeric fields safely
    const driverIdValue =
      driver_id !== undefined ? parseInt(driver_id) : bin.driver_id;
    const capacityValue =
      capacity !== undefined ? parseInt(capacity) : bin.capacity;
    const currentLevelValue =
      current_level !== undefined ? parseInt(current_level) : bin.current_level;
    const latitudeValue =
      latitude !== undefined ? parseFloat(latitude) : bin.latitude;
    const longitudeValue =
      longitude !== undefined ? parseFloat(longitude) : bin.longitude;

    // Update bin with new values or keep old values if not provided
    const result = await pool.query(
      `UPDATE bins
       SET name = $1,
           location = $2,
           driver_id = $3,
           capacity = $4,
           current_level = $5,
           status = $6,
           latitude = $7,
           longitude = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name ?? bin.name, // if name is undefined, keep existing
        location ?? bin.location,
        driverIdValue,
        capacityValue,
        currentLevelValue,
        status ?? bin.status,
        latitudeValue,
        longitudeValue,
        binId,
      ],
    );

    res.json({ message: "Bin updated successfully", bin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};