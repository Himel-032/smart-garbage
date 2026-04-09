import  pool  from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../lib/utils/generateToken.js";  
import { sendEmail } from "../lib/utils/sendEmail.js";
import {
  uploadToCloudinary,
  deleteFromCloudinaryByUrl,
} from "../config/cloudinaryUpload.js";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_SELECT_FIELDS = "id, name, email, phone, photo_url, created_at, updated_at";

const getCookieOptions = (req, maxAge) => {
  const clientUrl = process.env.CLIENT_URL || "";
  const isLocalClient = clientUrl.includes("localhost") || clientUrl.includes("127.0.0.1");
  const isForwardedHttps = req.headers["x-forwarded-proto"] === "https";

  // Cross-site cookies (Vercel -> Render) must be SameSite=None and Secure.
  const secure = process.env.COOKIE_SECURE === "true" || (!isLocalClient && (req.secure || isForwardedHttps));
  const sameSite = process.env.COOKIE_SAME_SITE || (secure ? "none" : "lax");

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
  };
};

// Admin login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT ${ADMIN_SELECT_FIELDS}, password FROM admins WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const admin = result.rows[0];

    //  Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //  Create JWT token
    const token = generateToken(admin);

    res.cookie("token", token, getCookieOptions(req, 24 * 60 * 60 * 1000));

    //  Return admin info (without password) and token
    const { password: _, ...adminData } = admin;

    res.json({ admin: adminData, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// protected route 
export const getMe = async (req, res) => {
    res.json({ admin: req.admin });
}

export const updateAdminProfile = async (req, res) => {
  const adminId = req.admin.id;
  const { name, email, phone, currentPassword, newPassword } = req.body;

  let uploadedPhotoUrl = null;

  try {
    const adminResult = await pool.query(
      `SELECT id, name, email, phone, photo_url, password FROM admins WHERE id = $1`,
      [adminId],
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const existingAdmin = adminResult.rows[0];
    const nextEmail = email?.trim();
    const nextName = name?.trim();
    const nextPhone = phone?.trim();

    if (nextEmail && nextEmail.toLowerCase() !== existingAdmin.email.toLowerCase()) {
      const emailCheck = await pool.query(
        "SELECT id FROM admins WHERE email = $1 AND id <> $2",
        [nextEmail.toLowerCase(), adminId],
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: "Email already exists for another admin" });
      }
    }

    let hashedPassword = null;
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingAdmin.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "smart_garbage/admins");
      uploadedPhotoUrl = uploadResult.secure_url;
    }

    if (uploadedPhotoUrl && existingAdmin.photo_url) {
      await deleteFromCloudinaryByUrl(existingAdmin.photo_url);
    }

    const updateResult = await pool.query(
      `UPDATE admins SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        password = COALESCE($4, password),
        photo_url = COALESCE($5, photo_url),
        updated_at = NOW()
      WHERE id = $6
      RETURNING ${ADMIN_SELECT_FIELDS}`,
      [
        nextName || null,
        nextEmail ? nextEmail.toLowerCase() : null,
        nextPhone || null,
        hashedPassword,
        uploadedPhotoUrl,
        adminId,
      ],
    );

    res.json({
      message: "Profile updated successfully",
      admin: updateResult.rows[0],
    });
  } catch (err) {
    if (uploadedPhotoUrl) {
      try {
        await deleteFromCloudinaryByUrl(uploadedPhotoUrl);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded admin photo:", cleanupError.message);
      }
    }

    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists for another admin" });
    }

    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// logout admin
export const logoutAdmin = async (req, res) => {
  res.cookie("token", "", getCookieOptions(req, 0));
    res.json({ message: "Logged out successfully" });
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // check if admin exists
    const result = await pool.query(`SELECT ${ADMIN_SELECT_FIELDS}, password FROM admins WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }
    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // hash token before saving to db
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // save token and expiry 15min
    await pool.query(
      `UPDATE admins 
       SET reset_token = $1, 
           reset_token_expires = NOW() + INTERVAL '15 minutes'
       WHERE email = $2`,
      [hashedToken, email]
    );
    // create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // send mail
    const subject = "Reset Your Password";
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `;
    await sendEmail({ to: email, subject, html });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  try {
    // hash received token
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    // find admin with matching token and valid expiry
    const result = await pool.query(
      `SELECT * FROM admins 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [hashedToken]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // update password & clear reset token fields
    const admin = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE admins 
       SET password = $1,
           reset_token = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    );
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateResetToken = async (req, res) => {
  const { token } = req.params;
  try {
    // hash received token
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    // find admin with matching token and valid expiry
    const result = await pool.query(
      `SELECT * FROM admins 
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