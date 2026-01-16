import  pool  from "../db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils/generateToken.js";  

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
