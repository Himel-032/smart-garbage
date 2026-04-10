import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const addBin = async (req, res) => {
  try {
    const { name, location, driver_id, capacity, latitude, longitude } =
      req.body;
    const driverIdValue =
      driver_id && !isNaN(parseInt(driver_id)) ? parseInt(driver_id) : null;

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
    res.status(500).json({ message: "sServer error" });
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
export const getAllUnassignedBins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM bins WHERE driver_id IS NULL ORDER BY id ASC`,
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
    const { rows } = await pool.query("SELECT * FROM bins WHERE id = $1", [
      binId,
    ]);

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
      driver_id && !isNaN(parseInt(driver_id)) ? parseInt(driver_id) : null;
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
 const calculateFillLevel = (weight_gm, distance_cm) => {
   const MAX_WEIGHT = 1000;
   const MAX_DISTANCE = 14;

   const weight = Math.max(0, Math.min(Number(weight_gm), MAX_WEIGHT));
   let distance = Math.max(0, Math.min(Number(distance_cm), MAX_DISTANCE));
   if (distance_cm >= MAX_DISTANCE) {
     distance = 0.5;
   }

  
   // 1. Normalize inputs (0–100)
   const weightFill = (weight / MAX_WEIGHT) * 100;

   // smaller distance = more full
   const distanceFill = ((MAX_DISTANCE - distance) / MAX_DISTANCE) * 100;

   
   // 2. Adaptive weighting
  

   const distanceRatio = distance / MAX_DISTANCE; // 0 (full) → 1 (empty)

   const weightFactor = 0.35; // fixed support status
   const distanceFactor = 1 - weightFactor;

   
   // 3. Final fill level
  
   const fillLevel = Math.round(
     weightFactor * weightFill + distanceFactor * distanceFill,
   );

  
  
   
   let fillStatus = "Empty";

   if (fillLevel >= 85) fillStatus = "Full";
   else if (fillLevel >= 60) fillStatus = "High";
   else if (fillLevel >= 35) fillStatus = "Medium";
   else if (fillLevel >= 10) fillStatus = "Low";

   return {
     fillLevel,
     fillStatus,
     weightFill: Math.round(weightFill),
     distanceFill: Math.round(distanceFill),
   };
 };
export const receiveBinData = async (req, res) => {
  const auth = req.headers.authorization;

  if (auth !== process.env.BIN_AUTH_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { device_name, weight_gm, distance_cm } = req.body;

  const { fillLevel, fillStatus, weightFill, distanceFill } = calculateFillLevel(
    weight_gm,
    distance_cm,
  );
  const result = await pool.query(`SELECT current_level FROM bins WHERE name = $1`, [device_name]);
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Bin not found" });
  }
  if (Math.abs(result.rows[0].current_level - fillLevel) > 5 && weightFill > 5) {
    console.log(device_name, weight_gm, distance_cm);
    await pool.query(
      `UPDATE bins SET current_level = $1, updated_at = NOW() WHERE name = $2`,
      [fillLevel, device_name],
    );
    res.json({ status: "send to database" });
  } else {
    res.json({ status: "no significant change" });
  }

  
};

export const getAssignedBins = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const result = await pool.query(
      "SELECT * FROM bins WHERE driver_id = $1 ORDER BY id ASC",
      [driverId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};