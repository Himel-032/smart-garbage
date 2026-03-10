import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Get analytics for a single bin
 * Query params: range=daily|weekly|monthly
 */
export const getBinAnalytics = async (req, res) => {
  const { binId } = req.params;
  const { range = "daily" } = req.query;

  const binIdInt = parseInt(binId);
  if (isNaN(binIdInt)) {
    return res.status(400).json({ message: "Invalid bin ID" });
  }

  try {
    let query = "";

    if (range === "daily") {
      query = `
        SELECT DATE(recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        WHERE bin_id = $1
        GROUP BY period
        ORDER BY period DESC
        LIMIT 30
      `;
    } else if (range === "weekly") {
      query = `
        SELECT DATE_TRUNC('week', recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        WHERE bin_id = $1
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `;
    } else if (range === "monthly") {
      query = `
        SELECT DATE_TRUNC('month', recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        WHERE bin_id = $1
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `;
    } else {
      return res.status(400).json({ message: "Invalid range parameter" });
    }

    const { rows } = await pool.query(query, [binIdInt]);
    console.log(`Bin ${binIdInt} analytics (${range}):`, rows.length, "rows");
    
    // Reverse to show oldest to newest for charts
    const sortedRows = rows.reverse();
    
    res.json({ binId: binIdInt, range, data: sortedRows });
  } catch (err) {
    console.error("Get Bin Analytics Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get analytics for all bins combined
 * Query params: range=daily|weekly|monthly
 */
export const getAllBinsAnalytics = async (req, res) => {
  const { range = "daily" } = req.query;

  try {
    let query = "";

    if (range === "daily") {
      query = `
        SELECT DATE(recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        GROUP BY period
        ORDER BY period DESC
        LIMIT 30
      `;
    } else if (range === "weekly") {
      query = `
        SELECT DATE_TRUNC('week', recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `;
    } else if (range === "monthly") {
      query = `
        SELECT DATE_TRUNC('month', recorded_at) AS period,
               AVG(fill_level) AS fill
        FROM bin_readings
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `;
    } else {
      return res.status(400).json({ message: "Invalid range parameter" });
    }

    const { rows } = await pool.query(query);
    
    // Reverse to show oldest to newest for charts
    const sortedRows = rows.reverse();
    
    res.json({ range, data: sortedRows });
  } catch (err) {
    console.error("Get All Bins Analytics Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Optional: get top N bins by average fill level (for dashboard bar chart)
 * Query params: top=N
 */
export const getTopBinsAnalytics = async (req, res) => {
  const top = parseInt(req.query.top) || 5;

  try {
    const query = `
      SELECT b.id AS bin_id,
             b.name AS bin_name,
             AVG(br.fill_level) AS avg_fill
      FROM bins b
      JOIN bin_readings br ON b.id = br.bin_id
      GROUP BY b.id, b.name
      ORDER BY avg_fill DESC
      LIMIT $1
    `;

    const { rows } = await pool.query(query, [top]);
    console.log(`Top ${top} bins analytics:`, rows.length, "rows");
    console.log("Sample row:", rows[0]);
    res.json({ top, data: rows });
  } catch (err) {
    console.error("Get Top Bins Analytics Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
