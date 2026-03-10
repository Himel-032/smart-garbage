-- ============================================
-- QUICK FIX: Run this SQL to add 30 days of historical data
-- ============================================
-- For your bin IDs: 1, 2, 5, 7, 11
-- This creates realistic trending data for ALL analytics charts

-- Optional: Clear existing data first (uncomment if needed)
-- TRUNCATE TABLE bin_readings;

-- Generate 30 days of data for each bin using generate_series
-- Bin 1: Gradual increase 20-90%
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 
    1,
    (20 + (gs * 2.3) + (RANDOM() * 5 - 2.5))::INTEGER,
    NOW() - ((30 - gs) * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) gs;

-- Bin 2: Fluctuating 25-80%
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 
    2,
    (25 + (gs * 1.8) + (RANDOM() * 8 - 4))::INTEGER,
    NOW() - ((30 - gs) * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) gs;

-- Bin 5: High fill rate 30-95%
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 
    5,
    (30 + (gs * 2.2) + (RANDOM() * 6 - 3))::INTEGER,
    NOW() - ((30 - gs) * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) gs;

-- Bin 7: Low/moderate 15-70%
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 
    7,
    (15 + (gs * 1.8) + (RANDOM() * 5 - 2.5))::INTEGER,
    NOW() - ((30 - gs) * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) gs;

-- Bin 11: Very high fill rate 40-98%
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 
    11,
    (40 + (gs * 1.9) + (RANDOM() * 7 - 3.5))::INTEGER,
    NOW() - ((30 - gs) * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) gs;

-- Verify data was inserted
SELECT 
    'Data Summary' AS info,
    bin_id,
    COUNT(*) as reading_count,
    ROUND(AVG(fill_level), 1) as avg_fill_level,
    MIN(fill_level) as min_fill,
    MAX(fill_level) as max_fill,
    MIN(recorded_at)::DATE as oldest_date,
    MAX(recorded_at)::DATE as newest_date
FROM bin_readings
GROUP BY bin_id
ORDER BY avg_fill_level DESC;

-- Success message
SELECT '✅ SUCCESS! Analytics data added for bins 1, 2, 5, 7, 11' AS status;
SELECT '📊 Now refresh your /analytics page to see the graphs!' AS next_step;
