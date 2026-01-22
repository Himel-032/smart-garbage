
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        // get token from authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies.token;

        if(!token){
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if( !decoded ){
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        // get admin from db
        const result = await pool.query("SELECT id, name, email FROM admins WHERE id = $1", [decoded.id]);
        if( result.rows.length === 0 ){
            return res.status(401).json({ message: "Unauthorized: Admin not found" });
        }
        // attach admin to request object
        req.admin = result.rows[0];
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).json({ message: "Unauthorized: Token verification failed" });
    }
};