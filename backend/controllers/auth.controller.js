import  pool  from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../lib/utils/generateToken.js";  
import { sendEmail } from "../lib/utils/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

// Admin login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

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

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day;
    })

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

// logout admin
export const logoutAdmin = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
    });
    res.json({ message: "Logged out successfully" });
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // check if admin exists
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);

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