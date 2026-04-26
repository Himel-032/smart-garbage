import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../lib/utils/sendEmail.js";
import {
  uploadToCloudinary,
  deleteFromCloudinaryByUrl,
} from "../config/cloudinaryUpload.js";
import { authenticateDriver } from "../middleware/driverAuth.js";
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

export const getDriverPerformance = async (req, res) => {
  const { id } = req.params;
  const driverId = parseInt(id);

  if (isNaN(driverId)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }

  try {
    const driverResult = await pool.query(
      `SELECT id, name, email, phone, photo_url, status
       FROM drivers
       WHERE id = $1`,
      [driverId],
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const binsResult = await pool.query(
      `SELECT
         id,
         name,
         location,
         capacity,
         current_level,
         ROUND(
           CASE
             WHEN COALESCE(capacity, 0) = 0 THEN 0
             ELSE (COALESCE(current_level, 0)::numeric / NULLIF(capacity, 0)) * 100
           END,
           2
         ) AS fill_percentage
       FROM bins
       WHERE driver_id = $1
       ORDER BY id ASC`,
      [driverId],
    );

    const assignedBins = binsResult.rows.map((bin) => ({
      ...bin,
      fill_percentage: Number(bin.fill_percentage) || 0,
    }));

    const performanceResult = await pool.query(
      `WITH low_readings AS (
         SELECT br.id, br.bin_id, br.recorded_at AS low_at
         FROM bin_readings br
         JOIN bins b ON b.id = br.bin_id
         WHERE b.driver_id = $1
           AND br.recorded_at >= date_trunc('month', NOW())
           AND br.recorded_at < date_trunc('month', NOW()) + interval '1 month'
           AND br.fill_level < 20
       ),
       detected_events AS (
         SELECT
           lr.bin_id,
           lr.low_at,
           ph.high_at,
           EXTRACT(EPOCH FROM (lr.low_at - ph.high_at)) / 3600.0 AS response_hours
         FROM low_readings lr
         JOIN LATERAL (
           SELECT br2.recorded_at AS high_at
           FROM bin_readings br2
           WHERE br2.bin_id = lr.bin_id
             AND br2.fill_level >= 80
             AND br2.recorded_at <= lr.low_at
             AND br2.recorded_at >= lr.low_at - interval '2 hours'
           ORDER BY br2.recorded_at DESC
           LIMIT 1
         ) ph ON TRUE
       )
       SELECT
         COUNT(*)::int AS collections_this_month,
         ROUND(AVG(response_hours)::numeric, 2) AS avg_response_time_hours
       FROM detected_events`,
      [driverId],
    );

    const collectionsThisMonth =
      performanceResult.rows[0]?.collections_this_month || 0;
    const avgResponseTimeHoursRaw =
      performanceResult.rows[0]?.avg_response_time_hours;

    const binStatusSummary = assignedBins.reduce(
      (summary, bin) => {
        const fill = Number(bin.fill_percentage) || 0;

        summary.total += 1;
        if (fill >= 80) summary.full += 1;
        else if (fill >= 60) summary.high += 1;
        else if (fill >= 35) summary.medium += 1;
        else if (fill >= 10) summary.low += 1;
        else summary.empty += 1;

        return summary;
      },
      { total: 0, full: 0, high: 0, medium: 0, low: 0, empty: 0 },
    );

    res.json({
      driver: driverResult.rows[0],
      assignedBins,
      collectionsThisMonth,
      avgResponseTimeHours:
        avgResponseTimeHoursRaw === null ? null : Number(avgResponseTimeHoursRaw),
      binStatusSummary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res
        .status(400)
        .json({ message: "driver_id and bin_ids are required" });
    }
    // STEP 1: Remove bins that were deselected
    await pool.query(
      `UPDATE bins 
       SET driver_id = NULL 
       WHERE driver_id = $1 
       AND id != ALL($2::int[])`,
      [driver_id, bin_ids],
    );

    // STEP 2: Assign selected bins
    if (bin_ids.length > 0) {
      await pool.query(
        `UPDATE bins 
         SET driver_id = $1 
         WHERE id = ANY($2::int[]) 
         AND (driver_id IS NULL OR driver_id = $1)`,
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

export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }
    const driver = await pool.query(
      "SELECT * FROM drivers WHERE email = $1 and status = 'active'",
      [email]
    );
    if (driver.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found or status is not active" });
    }
    const isMatch = await bcrypt.compare(password, driver.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: driver.rows[0].id, email: driver.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: Logging in failed" });
  }
};

export const driverHome = async ( req, res ) => {
  try {
    const driverId = req.driver.id;
     const driver = await pool.query(
      "SELECT id, name, email FROM drivers WHERE id = $1",
      [driverId]
    );
    res.json({
      message: "Welcome Driver",
      driver: driver.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: Fetching driver data failed" });
  }
};

export const logoutDriver = async (req, res) => {
  try {
    // JWT is stateless, so logout is just client-side deletion
    // Optionally, you can also implement token blacklisting in DB if needed
    res.json({
      message:
        "Driver logged out successfully. Please delete the token on the client.",
    });
  } catch (error) {
    console.error("Driver logout error:", error);
    res.status(500).json({ message: "Driver logout failed" });
  }
};

export const driverForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1️ Check if driver exists
    const driverResult = await pool.query(
      "SELECT id, email FROM drivers WHERE email=$1 AND status='active'",
      [email],
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ message: "Driver not found or status is not active" });
    }

    const driver = driverResult.rows[0];

    // generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // hash token before saving to db
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

    // 3️ Store token and expiry in DB
    await pool.query(
      "UPDATE drivers SET reset_token=$1, reset_token_expires=NOW() + interval '15 minutes' WHERE email=$2",
      [hashedToken, email],
    );

    // 4️ Create reset link (can open web page or deep link in app)
    // const resetLink = `https://yourapp.up.railway.app/reset-password?token=${resetToken}`;
    const resetLink = `${process.env.FRONTEND_URL}/driver/reset-password/${resetToken}`;

    // 5️ Send email using SendGrid
    await sendEmail({
      to: driver.email,
      subject: "Reset Your Password",
      html: `<p>Hi,</p>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link will expire in 15 minutes.</p>`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

export const driverResetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // hash received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // find driver with matching token and valid expiry
    const result = await pool.query(
      `SELECT * FROM drivers 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [hashedToken],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // update password & clear reset token fields
    const driver = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE drivers 
       SET password = $1,
           reset_token = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id],
    );
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateDriverResetToken = async (req, res) => {
  const { token } = req.params;
  try {
    // hash received token
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    // find driver with matching token and valid expiry
    const result = await pool.query(
      `SELECT * FROM drivers 
       WHERE reset_token = $1
        AND reset_token_expires > NOW()`,
      [hashedToken]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    res.json({valid: true});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

