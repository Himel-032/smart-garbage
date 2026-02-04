import pool from "../db.js";
import bcrypt from "bcryptjs";
import {
  uploadToCloudinary,
  deleteFromCloudinaryByUrl,
} from "../config/cloudinaryUpload.js";

export const getAllDrivers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, COUNT(b.id) AS assigned_bins
      FROM drivers d
      LEFT JOIN bins b ON d.id = b.driver_id
      GROUP BY d.id
      ORDER BY d.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDriver = async (req, res) => {
  try {
  const { name, phone, email, password } = req.body;
  const status = "pending";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, Email, Password required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  // photo url from multer file upload
  let photo_url = null;
  if (req.file) {
    const folderName = "smart_garbage/drivers";
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      folderName
    );
    photo_url = uploadResult.secure_url;
  }
  
    const result = await pool.query(
      "INSERT INTO drivers (name, phone, email, password, photo_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, phone, email, hashedPassword, photo_url, status]
    );
    res.status(201).json({message: "Driver created successfully", driver: result.rows[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: Creating driver failed" });
  }
};

export const getDriverById = async (req, res) => {
  const { id } = req.params;
  const driverId = parseInt(id);
  if (isNaN(driverId)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }
  try {
    const result = await pool.query(
      `
      SELECT d.*, json_agg(b.*) AS bins
      FROM drivers d
      LEFT JOIN bins b ON d.id = b.driver_id
      WHERE d.id=$1
      GROUP BY d.id
    `,
      [driverId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = parseInt(id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    const { name, phone, email, password, status } = req.body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    let photo_url = null;
    if (req.file) {
      const folderName = "smart_garbage/drivers";
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderName
      );
      photo_url = uploadResult.secure_url;
    }
    // delete existing photo on cloudinary if new photo is uploaded
    if (photo_url) {
      const existingDriver = await pool.query(
        "SELECT photo_url FROM drivers WHERE id = $1",
        [driverId],
      );
      const existingPhotoUrl = existingDriver.rows[0].photo_url;
      if (existingPhotoUrl) {
        console.log("Deleting existing photo from Cloudinary:", existingPhotoUrl);
        await deleteFromCloudinaryByUrl(existingPhotoUrl);
      }
    }

    const result = await pool.query(
      `UPDATE drivers SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        password = COALESCE($4, password),
        photo_url = COALESCE($5, photo_url),
        status = COALESCE($6, status),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [name, phone, email, hashedPassword, photo_url, status, driverId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({ message: "Driver updated successfully", driver: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const assignBins = async (req, res) => {
  try {
    const { driver_id, bin_ids } = req.body;
    if (!driver_id || !Array.isArray(bin_ids)) {
      return res.status(400).json({ message: "driver_id and bin_ids are required" });
    }
     if (bin_ids.length > 0) {
      await pool.query(
        `UPDATE bins SET driver_id=$1 WHERE id = ANY($2::int[]) AND (driver_id IS NULL OR driver_id = $1)`,
        [driver_id, bin_ids],
      );
    }
    res.json({ message: "Bins assigned successfully" }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: Assigning bins failed" });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = parseInt(id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    // First, fetch the existing driver to get the photo URL
    const existingDriver = await pool.query(
      "SELECT photo_url FROM drivers WHERE id = $1",
      [driverId],
    );
    if (existingDriver.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }
    const existingPhotoUrl = existingDriver.rows[0].photo_url;

    // Delete the driver from the database
    await pool.query("DELETE FROM drivers WHERE id = $1", [driverId]);
    // Delete the photo from Cloudinary if exists
    if (existingPhotoUrl) {
      console.log("Deleting photo from Cloudinary:", existingPhotoUrl);
      await deleteFromCloudinaryByUrl(existingPhotoUrl);
    }
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: Deleting driver failed" });
  }
};