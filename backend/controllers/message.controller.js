import pool from "../db.js";

// Search drivers for composing messages
export const searchDrivers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT id, name, email, phone, photo_url, status
      FROM drivers
      WHERE status = 'active'
    `;
    
    const params = [];
    
    if (search && search.trim()) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY name ASC LIMIT 50`;
    
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error searching drivers" });
  }
};

// Get list of conversations for admin (all drivers who have messaged)
export const getConversations = async (req, res) => {
  try {
    // Get admin id from the authenticated request
    const adminId = req.admin.id;

    // Get all distinct drivers who have had conversations with this admin
    const result = await pool.query(
      `SELECT DISTINCT 
        d.id, 
        d.name, 
        d.email, 
        d.phone, 
        d.photo_url,
        (SELECT content FROM messages 
         WHERE (sender_role='admin' AND sender_id=$1 AND receiver_role='driver' AND receiver_id=d.id)
            OR (sender_role='driver' AND sender_id=d.id AND receiver_role='admin' AND receiver_id=$1)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_role='admin' AND sender_id=$1 AND receiver_role='driver' AND receiver_id=d.id)
            OR (sender_role='driver' AND sender_id=d.id AND receiver_role='admin' AND receiver_id=$1)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_role='driver' AND sender_id=d.id 
         AND receiver_role='admin' AND receiver_id=$1 
         AND read_status=FALSE) as unread_count
      FROM drivers d
      WHERE EXISTS (
        SELECT 1 FROM messages m
        WHERE (m.sender_role='admin' AND m.sender_id=$1 AND m.receiver_role='driver' AND m.receiver_id=d.id)
           OR (m.sender_role='driver' AND m.sender_id=d.id AND m.receiver_role='admin' AND m.receiver_id=$1)
      )
      ORDER BY last_message_time DESC`,
      [adminId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

export const getDriverConversations = async (req, res) => {
  try {
    // Get driver id from the authenticated request
    const driverId = req.driver.id;

    // Get all distinct admins who have had conversations with this driver
    const result = await pool.query(
      `SELECT DISTINCT 
        a.id, 
        a.name, 
        a.email, 
        (SELECT content FROM messages 
         WHERE (sender_role='driver' AND sender_id=$1 AND receiver_role='admin' AND receiver_id=a.id)
            OR (sender_role='admin' AND sender_id=a.id AND receiver_role='driver' AND receiver_id=$1)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_role='driver' AND sender_id=$1 AND receiver_role='admin' AND receiver_id=a.id)
            OR (sender_role='admin' AND sender_id=a.id AND receiver_role='driver' AND receiver_id=$1)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_role='admin' AND sender_id=a.id 
         AND receiver_role='driver' AND receiver_id=$1 
         AND read_status=FALSE) as unread_count
      FROM admins a
      WHERE EXISTS (
        SELECT 1 FROM messages m
        WHERE (m.sender_role='driver' AND m.sender_id=$1 AND m.receiver_role='admin' AND m.receiver_id=a.id)
           OR (m.sender_role='admin' AND m.sender_id=a.id AND m.receiver_role='driver' AND m.receiver_id=$1)
      )
      ORDER BY last_message_time DESC`,
      [driverId],
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching conversations for driver" });
  }
};

// REST endpoint to fetch conversation
export const getMessages = async (req, res) => {
  try {
    const { user_role, user_id, other_role, other_id } = req.query;

    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_role=$1 AND sender_id=$2 AND receiver_role=$3 AND receiver_id=$4)
          OR (sender_role=$3 AND sender_id=$4 AND receiver_role=$1 AND receiver_id=$2)
       ORDER BY created_at ASC`,
      [user_role, user_id, other_role, other_id],
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};


// Send message (POST)
export const sendMessage = async (req, res) => {
  try {
    const { receiver_role, receiver_id, content } = req.body;

    // Determine sender from request (admin or driver)
    let sender_role, sender_id;
    if(req.admin){
      sender_role = "admin";
      sender_id = req.admin.id;
    } else if(req.driver){
      sender_role = "driver";
      sender_id = req.driver.id;
    } else {
      return res.status(401).json({ message: "Unauthorized: No sender found" });
    }

    // Save to DB
    const result = await pool.query(
      `INSERT INTO messages 
       (sender_role, sender_id, receiver_role, receiver_id, content)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [sender_role, sender_id, receiver_role, receiver_id, content]
    );

    const savedMessage = result.rows[0];
    res.status(201).json({ message: "Message sent", data: savedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { driver_id } = req.body;
    const admin_id = req.admin.id;

    await pool.query(
      `UPDATE messages 
       SET read_status = TRUE 
       WHERE sender_role = 'driver' 
       AND sender_id = $1 
       AND receiver_role = 'admin' 
       AND receiver_id = $2 
       AND read_status = FALSE`,
      [driver_id, admin_id]
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking messages as read" });
  }
};
