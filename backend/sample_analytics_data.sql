-- ============================================
-- Historical Data for Analytics Testing
-- ============================================
-- This script adds 30 days of historical data for YOUR bin IDs: 1, 2, 5, 7, 11
-- This will make all charts display properly with trends

-- CLEAR EXISTING DATA (optional - remove this if you want to keep existing data)
-- TRUNCATE TABLE bin_readings;

-- ============================================
-- BIN 1 - Gradually increasing pattern
-- ============================================
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(1, 20, NOW() - INTERVAL '30 days'),
(1, 25, NOW() - INTERVAL '29 days'),
(1, 30, NOW() - INTERVAL '28 days'),
(1, 35, NOW() - INTERVAL '27 days'),
(1, 40, NOW() - INTERVAL '26 days'),
(1, 42, NOW() - INTERVAL '25 days'),
(1, 45, NOW() - INTERVAL '24 days'),
(1, 48, NOW() - INTERVAL '23 days'),
(1, 50, NOW() - INTERVAL '22 days'),
(1, 52, NOW() - INTERVAL '21 days'),
(1, 55, NOW() - INTERVAL '20 days'),
(1, 58, NOW() - INTERVAL '19 days'),
(1, 60, NOW() - INTERVAL '18 days'),
(1, 62, NOW() - INTERVAL '17 days'),
(1, 65, NOW() - INTERVAL '16 days'),
(1, 68, NOW() - INTERVAL '15 days'),
(1, 70, NOW() - INTERVAL '14 days'),
(1, 72, NOW() - INTERVAL '13 days'),
(1, 75, NOW() - INTERVAL '12 days'),
(1, 78, NOW() - INTERVAL '11 days'),
(1, 80, NOW() - INTERVAL '10 days'),
(1, 82, NOW() - INTERVAL '9 days'),
(1, 85, NOW() - INTERVAL '8 days'),
(1, 88, NOW() - INTERVAL '7 days'),
(1, 90, NOW() - INTERVAL '6 days'),
(1, 92, NOW() - INTERVAL '5 days'),
(1, 25, NOW() - INTERVAL '4 days'),  -- Emptied
(1, 30, NOW() - INTERVAL '3 days'),
(1, 35, NOW() - INTERVAL '2 days'),
(1, 40, NOW() - INTERVAL '1 day');

-- ============================================
-- BIN 2 - Fluctuating pattern with regular emptying
-- ============================================
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(2, 25, NOW() - INTERVAL '30 days'),
(2, 35, NOW() - INTERVAL '29 days'),
(2, 45, NOW() - INTERVAL '28 days'),
(2, 55, NOW() - INTERVAL '27 days'),
(2, 60, NOW() - INTERVAL '26 days'),
(2, 65, NOW() - INTERVAL '25 days'),
(2, 70, NOW() - INTERVAL '24 days'),
(2, 75, NOW() - INTERVAL '23 days'),
(2, 80, NOW() - INTERVAL '22 days'),
(2, 85, NOW() - INTERVAL '21 days'),
(2, 90, NOW() - INTERVAL '20 days'),
(2, 20, NOW() - INTERVAL '19 days'),  -- Emptied
(2, 30, NOW() - INTERVAL '18 days'),
(2, 40, NOW() - INTERVAL '17 days'),
(2, 50, NOW() - INTERVAL '16 days'),
(2, 55, NOW() - INTERVAL '15 days'),
(2, 60, NOW() - INTERVAL '14 days'),
(2, 65, NOW() - INTERVAL '13 days'),
(2, 70, NOW() - INTERVAL '12 days'),
(2, 75, NOW() - INTERVAL '11 days'),
(2, 82, NOW() - INTERVAL '10 days'),
(2, 88, NOW() - INTERVAL '9 days'),
(2, 25, NOW() - INTERVAL '8 days'),   -- Emptied
(2, 35, NOW() - INTERVAL '7 days'),
(2, 45, NOW() - INTERVAL '6 days'),
(2, 50, NOW() - INTERVAL '5 days'),
(2, 58, NOW() - INTERVAL '4 days'),
(2, 63, NOW() - INTERVAL '3 days'),
(2, 68, NOW() - INTERVAL '2 days'),
(2, 75, NOW() - INTERVAL '1 day');

-- ============================================
-- BIN 5 - High fill rate (fills quickly)
-- ============================================
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(5, 30, NOW() - INTERVAL '30 days'),
(5, 40, NOW() - INTERVAL '29 days'),
(5, 50, NOW() - INTERVAL '28 days'),
(5, 60, NOW() - INTERVAL '27 days'),
(5, 70, NOW() - INTERVAL '26 days'),
(5, 80, NOW() - INTERVAL '25 days'),
(5, 90, NOW() - INTERVAL '24 days'),
(5, 95, NOW() - INTERVAL '23 days'),
(5, 30, NOW() - INTERVAL '22 days'),  -- Emptied
(5, 45, NOW() - INTERVAL '21 days'),
(5, 55, NOW() - INTERVAL '20 days'),
(5, 65, NOW() - INTERVAL '19 days'),
(5, 75, NOW() - INTERVAL '18 days'),
(5, 85, NOW() - INTERVAL '17 days'),
(5, 92, NOW() - INTERVAL '16 days'),
(5, 35, NOW() - INTERVAL '15 days'),  -- Emptied
(5, 48, NOW() - INTERVAL '14 days'),
(5, 58, NOW() - INTERVAL '13 days'),
(5, 68, NOW() - INTERVAL '12 days'),
(5, 78, NOW() - INTERVAL '11 days'),
(5, 88, NOW() - INTERVAL '10 days'),
(5, 93, NOW() - INTERVAL '9 days'),
(5, 30, NOW() - INTERVAL '8 days'),   -- Emptied
(5, 42, NOW() - INTERVAL '7 days'),
(5, 52, NOW() - INTERVAL '6 days'),
(5, 62, NOW() - INTERVAL '5 days'),
(5, 72, NOW() - INTERVAL '4 days'),
(5, 80, NOW() - INTERVAL '3 days'),
(5, 88, NOW() - INTERVAL '2 days'),
(5, 93, NOW() - INTERVAL '1 day');

-- ============================================
-- BIN 7 - Low/moderate fill rate
-- ============================================
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(7, 15, NOW() - INTERVAL '30 days'),
(7, 18, NOW() - INTERVAL '29 days'),
(7, 22, NOW() - INTERVAL '28 days'),
(7, 25, NOW() - INTERVAL '27 days'),
(7, 28, NOW() - INTERVAL '26 days'),
(7, 32, NOW() - INTERVAL '25 days'),
(7, 35, NOW() - INTERVAL '24 days'),
(7, 38, NOW() - INTERVAL '23 days'),
(7, 42, NOW() - INTERVAL '22 days'),
(7, 45, NOW() - INTERVAL '21 days'),
(7, 48, NOW() - INTERVAL '20 days'),
(7, 52, NOW() - INTERVAL '19 days'),
(7, 55, NOW() - INTERVAL '18 days'),
(7, 58, NOW() - INTERVAL '17 days'),
(7, 62, NOW() - INTERVAL '16 days'),
(7, 65, NOW() - INTERVAL '15 days'),
(7, 15, NOW() - INTERVAL '14 days'),  -- Emptied
(7, 20, NOW() - INTERVAL '13 days'),
(7, 24, NOW() - INTERVAL '12 days'),
(7, 28, NOW() - INTERVAL '11 days'),
(7, 32, NOW() - INTERVAL '10 days'),
(7, 36, NOW() - INTERVAL '9 days'),
(7, 40, NOW() - INTERVAL '8 days'),
(7, 44, NOW() - INTERVAL '7 days'),
(7, 48, NOW() - INTERVAL '6 days'),
(7, 52, NOW() - INTERVAL '5 days'),
(7, 56, NOW() - INTERVAL '4 days'),
(7, 60, NOW() - INTERVAL '3 days'),
(7, 64, NOW() - INTERVAL '2 days'),
(7, 68, NOW() - INTERVAL '1 day');

-- ============================================
-- BIN 11 - Very high fill rate (busy area)
-- ============================================
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(11, 50, NOW() - INTERVAL '30 days'),
(11, 60, NOW() - INTERVAL '29 days'),
(11, 70, NOW() - INTERVAL '28 days'),
(11, 78, NOW() - INTERVAL '27 days'),
(11, 85, NOW() - INTERVAL '26 days'),
(11, 90, NOW() - INTERVAL '25 days'),
(11, 95, NOW() - INTERVAL '24 days'),
(11, 40, NOW() - INTERVAL '23 days'),  -- Emptied
(11, 52, NOW() - INTERVAL '22 days'),
(11, 62, NOW() - INTERVAL '21 days'),
(11, 72, NOW() - INTERVAL '20 days'),
(11, 80, NOW() - INTERVAL '19 days'),
(11, 88, NOW() - INTERVAL '18 days'),
(11, 93, NOW() - INTERVAL '17 days'),
(11, 35, NOW() - INTERVAL '16 days'),  -- Emptied
(11, 48, NOW() - INTERVAL '15 days'),
(11, 58, NOW() - INTERVAL '14 days'),
(11, 68, NOW() - INTERVAL '13 days'),
(11, 75, NOW() - INTERVAL '12 days'),
(11, 82, NOW() - INTERVAL '11 days'),
(11, 90, NOW() - INTERVAL '10 days'),
(11, 95, NOW() - INTERVAL '9 days'),
(11, 38, NOW() - INTERVAL '8 days'),   -- Emptied
(11, 50, NOW() - INTERVAL '7 days'),
(11, 60, NOW() - INTERVAL '6 days'),
(11, 70, NOW() - INTERVAL '5 days'),
(11, 78, NOW() - INTERVAL '4 days'),
(11, 85, NOW() - INTERVAL '3 days'),
(11, 92, NOW() - INTERVAL '2 days'),
(11, 96, NOW() - INTERVAL '1 day');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Total readings count
SELECT 'Total bin readings:' AS info, COUNT(*) AS count FROM bin_readings;

-- Data by bin
SELECT 
    bin_id,
    COUNT(*) AS reading_count,
    ROUND(AVG(fill_level), 2) AS avg_fill,
    MIN(fill_level) AS min_fill,
    MAX(fill_level) AS max_fill,
    MIN(recorded_at)::DATE AS oldest_date,
    MAX(recorded_at)::DATE AS newest_date
FROM bin_readings
GROUP BY bin_id
ORDER BY avg_fill DESC;

-- Sample of recent data
SELECT 
    br.bin_id,
    b.name AS bin_name,
    br.fill_level,
    br.recorded_at
FROM bin_readings br
LEFT JOIN bins b ON b.id = br.bin_id
ORDER BY br.recorded_at DESC
LIMIT 20;
(2, 45, NOW() - INTERVAL '24 days'),
(2, 55, NOW() - INTERVAL '23 days'),
(2, 60, NOW() - INTERVAL '22 days'),
(2, 65, NOW() - INTERVAL '21 days'),
(2, 70, NOW() - INTERVAL '20 days'),
(2, 75, NOW() - INTERVAL '19 days'),
(2, 80, NOW() - INTERVAL '18 days'),
(2, 85, NOW() - INTERVAL '17 days'),
(2, 90, NOW() - INTERVAL '16 days'),
(2, 25, NOW() - INTERVAL '15 days'),  -- Emptied
(2, 30, NOW() - INTERVAL '14 days'),
(2, 40, NOW() - INTERVAL '13 days'),
(2, 50, NOW() - INTERVAL '12 days'),
(2, 55, NOW() - INTERVAL '11 days'),
(2, 60, NOW() - INTERVAL '10 days'),
(2, 70, NOW() - INTERVAL '9 days'),
(2, 75, NOW() - INTERVAL '8 days'),
(2, 80, NOW() - INTERVAL '7 days'),
(2, 85, NOW() - INTERVAL '6 days'),
(2, 90, NOW() - INTERVAL '5 days'),
(2, 20, NOW() - INTERVAL '4 days'),   -- Emptied
(2, 30, NOW() - INTERVAL '3 days'),
(2, 40, NOW() - INTERVAL '2 days'),
(2, 50, NOW() - INTERVAL '1 day');

-- Sample readings for Bin 3 (consistent pattern)
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(5, 15, NOW() - INTERVAL '30 days'),
(5, 20, NOW() - INTERVAL '29 days'),
(5, 25, NOW() - INTERVAL '28 days'),
(5, 30, NOW() - INTERVAL '27 days'),
(5, 35, NOW() - INTERVAL '26 days'),
(5, 40, NOW() - INTERVAL '25 days'),
(5, 45, NOW() - INTERVAL '24 days'),
(5, 50, NOW() - INTERVAL '23 days'),
(5, 55, NOW() - INTERVAL '22 days'),
(5, 60, NOW() - INTERVAL '21 days'),
(5, 65, NOW() - INTERVAL '20 days'),
(5, 70, NOW() - INTERVAL '19 days'),
(5, 15, NOW() - INTERVAL '18 days'),  -- Emptied
(5, 20, NOW() - INTERVAL '17 days'),
(5, 25, NOW() - INTERVAL '16 days'),
(5, 30, NOW() - INTERVAL '15 days'),
(5, 35, NOW() - INTERVAL '14 days'),
(5, 40, NOW() - INTERVAL '13 days'),
(5, 45, NOW() - INTERVAL '12 days'),
(5, 50, NOW() - INTERVAL '11 days'),
(5, 55, NOW() - INTERVAL '10 days'),
(5, 60, NOW() - INTERVAL '9 days'),
(5, 65, NOW() - INTERVAL '8 days'),
(5, 70, NOW() - INTERVAL '7 days'),
(5, 15, NOW() - INTERVAL '6 days'),   -- Emptied
(5, 20, NOW() - INTERVAL '5 days'),
(5, 25, NOW() - INTERVAL '4 days'),
(5, 30, NOW() - INTERVAL '3 days'),
(5, 35, NOW() - INTERVAL '2 days'),
(5, 40, NOW() - INTERVAL '1 day');

-- Sample readings for Bin 4 (lower fill rate)
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(7, 10, NOW() - INTERVAL '30 days'),
(7, 15, NOW() - INTERVAL '28 days'),
(7, 20, NOW() - INTERVAL '26 days'),
(7, 25, NOW() - INTERVAL '24 days'),
(7, 30, NOW() - INTERVAL '22 days'),
(7, 35, NOW() - INTERVAL '20 days'),
(7, 40, NOW() - INTERVAL '18 days'),
(7, 45, NOW() - INTERVAL '16 days'),
(7, 50, NOW() - INTERVAL '14 days'),
(7, 55, NOW() - INTERVAL '12 days'),
(7, 10, NOW() - INTERVAL '10 days'),  -- Emptied
(7, 15, NOW() - INTERVAL '8 days'),
(7, 20, NOW() - INTERVAL '6 days'),
(7, 25, NOW() - INTERVAL '4 days'),
(7, 30, NOW() - INTERVAL '2 days');

-- Sample readings for Bin 5 (high fill rate)
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) VALUES
(11, 40, NOW() - INTERVAL '30 days'),
(11, 50, NOW() - INTERVAL '29 days'),
(11, 60, NOW() - INTERVAL '28 days'),
(11, 70, NOW() - INTERVAL '27 days'),
(11, 80, NOW() - INTERVAL '26 days'),
(11, 90, NOW() - INTERVAL '25 days'),
(11, 95, NOW() - INTERVAL '24 days'),
(11, 30, NOW() - INTERVAL '23 days'),  -- Emptied
(11, 40, NOW() - INTERVAL '22 days'),
(11, 50, NOW() - INTERVAL '21 days'),
(11, 60, NOW() - INTERVAL '20 days'),
(11, 70, NOW() - INTERVAL '19 days'),
(11, 80, NOW() - INTERVAL '18 days'),
(11, 90, NOW() - INTERVAL '17 days'),
(11, 95, NOW() - INTERVAL '16 days'),
(11, 30, NOW() - INTERVAL '15 days'),  -- Emptied
(11, 45, NOW() - INTERVAL '14 days'),
(11, 55, NOW() - INTERVAL '13 days'),
(11, 65, NOW() - INTERVAL '12 days'),
(11, 75, NOW() - INTERVAL '11 days'),
(11, 85, NOW() - INTERVAL '10 days'),
(11, 92, NOW() - INTERVAL '9 days'),
(11, 35, NOW() - INTERVAL '8 days'),   -- Emptied
(11, 50, NOW() - INTERVAL '7 days'),
(11, 60, NOW() - INTERVAL '6 days'),
(11, 70, NOW() - INTERVAL '5 days'),
(11, 80, NOW() - INTERVAL '4 days'),
(11, 85, NOW() - INTERVAL '3 days'),
(11, 90, NOW() - INTERVAL '2 days'),
(11, 95, NOW() - INTERVAL '1 day');

-- Verify the data
SELECT 'Total bin readings inserted:' AS info, COUNT(*) AS count FROM bin_readings;

-- View sample data by bin
SELECT 
    b.id AS bin_id,
    b.name AS bin_name,
    COUNT(br.id) AS reading_count,
    AVG(br.fill_level) AS avg_fill_level,
    MIN(br.fill_level) AS min_fill,
    MAX(br.fill_level) AS max_fill
FROM bins b
LEFT JOIN bin_readings br ON b.id = br.bin_id
GROUP BY b.id, b.name
ORDER BY b.id;

-- Note: Replace bin_id values (1, 2, 3, 4, 5) with your actual bin IDs
-- You can check your bin IDs with: SELECT id, name FROM bins;
