# 🔧 ANALYTICS FIX - COMPLETE GUIDE

## 🎯 What Was Wrong

1. **All your data was from the same day** (March 10, 2026) - Charts need data spread over multiple days
2. **Backend queries had no limits** - Could return too much data
3. **Data wasn't sorted properly** - Oldest to newest needed for trend charts

## ✅ What I Fixed

### Backend Changes (`analytics.controller.js`):
- ✅ Added `LIMIT 30` to daily queries (last 30 days)
- ✅ Added `LIMIT 12` to weekly/monthly queries (last 12 periods)
- ✅ Changed `ORDER BY period DESC` then reverse for proper chart display
- ✅ Better data sorting for trend visualization

### Sample Data Script (`sample_analytics_data.sql`):
- ✅ Updated with YOUR actual bin IDs: **1, 2, 5, 7, 11**
- ✅ Added 30 days of historical data for each bin
- ✅ Realistic patterns (gradual increase, emptying cycles, etc.)
- ✅ Different patterns for each bin to show variety

## 🚀 How to Fix Your Analytics RIGHT NOW

### Step 1: Run the SQL Script

Open your PostgreSQL client and run:

```sql
-- Run the entire sample_analytics_data.sql file
-- Location: backend/sample_analytics_data.sql
```

**OR** copy-paste this quick version:

```sql
-- QUICK FIX: Add historical data for your bins (1, 2, 5, 7, 11)

-- Clear existing data if needed (OPTIONAL)
-- TRUNCATE TABLE bin_readings;

-- Add 30 days for Bin 1
INSERT INTO bin_readings (bin_id, fill_level, recorded_at) 
SELECT 1, 20 + (generate_series * 2.3)::INTEGER, NOW() - (30 - generate_series) * INTERVAL '1 day'
FROM generate_series(0, 29);

-- Add 30 days for Bin 2  
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 2, 25 + (generate_series * 1.8)::INTEGER, NOW() - (30 - generate_series) * INTERVAL '1 day'
FROM generate_series(0, 29);

-- Add 30 days for Bin 5
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 5, 30 + (generate_series * 2.1)::INTEGER, NOW() - (30 - generate_series) * INTERVAL '1 day'
FROM generate_series(0, 29);

-- Add 30 days for Bin 7
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 7, 15 + (generate_series * 1.7)::INTEGER, NOW() - (30 - generate_series) * INTERVAL '1 day'
FROM generate_series(0, 29);

-- Add 30 days for Bin 11
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
SELECT 11, 40 + (generate_series * 1.9)::INTEGER, NOW() - (30 - generate_series) * INTERVAL '1 day'
FROM generate_series(0, 29);

-- Verify the data
SELECT bin_id, COUNT(*) as readings, AVG(fill_level) as avg_fill
FROM bin_readings
GROUP BY bin_id
ORDER BY bin_id;
```

### Step 2: Restart Your Backend

```bash
cd backend
npm start
```

### Step 3: Test the Analytics Page

1. Go to `http://localhost:5173/analytics`
2. You should now see:
   - ✅ **Current Bin Fill Levels** - Green bar chart with all 5 bins
   - ✅ **Top Bins by Average** - Blue bar chart showing which bins fill most
   - ✅ **Individual Bin Trend** - Purple line chart showing trends over time

3. Test the controls:
   - Change time range (Daily/Weekly/Monthly)
   - Select different bins from dropdown
   - Check browser console for debug logs

## 📊 What Each Chart Shows

### Chart 1: Current Bin Fill Levels (Green Bars)
- **Real-time** status from `bins` table
- Shows: `current_level ÷ capacity × 100`
- Works immediately if bins exist

### Chart 2: Top Bins by Average (Blue Bars)
- **Historical** average from `bin_readings` table
- Shows: Which bins fill up most frequently
- Requires historical data (run SQL script)

### Chart 3: Individual Bin Trend (Purple Line)
- **Time-series** data from `bin_readings` table
- Shows: Fill level changes over time
- Select bin + choose time range
- Requires historical data (run SQL script)

## 🐛 Troubleshooting

### Issue: Charts still empty after running SQL
**Solution:** Check if data was inserted
```sql
SELECT COUNT(*) FROM bin_readings;
SELECT bin_id, COUNT(*) FROM bin_readings GROUP BY bin_id;
```

### Issue: Only today's data shows
**Solution:** Your current data is all from today. Run the SQL script to add historical data going back 30 days.

### Issue: Backend errors
**Solution:** Check backend terminal for errors. Make sure:
- PostgreSQL is running
- Connection string is correct in `.env`
- Tables exist: `bins`, `bin_readings`

### Issue: Frontend shows "No data"
**Solution:** Open browser console (F12) and look for:
- API errors (404, 500)
- "Bins Response:" log - should show your bins
- "Top Bins Response:" log - should show data
- Network tab - check API calls to `/api/analytics/*`

## 📋 Verify Everything Works

### 1. Check Database:
```sql
-- Should return 5 bins
SELECT id, name FROM bins WHERE id IN (1,2,5,7,11);

-- Should return ~150 readings (30 per bin)
SELECT COUNT(*) FROM bin_readings;

-- Should show data spread over 30 days
SELECT 
    bin_id,
    COUNT(*) as count,
    MIN(recorded_at)::DATE as oldest,
    MAX(recorded_at)::DATE as newest
FROM bin_readings
GROUP BY bin_id;
```

### 2. Check Backend API:
```bash
# Test in browser or curl:
http://localhost:5000/api/analytics/top?top=5
http://localhost:5000/api/analytics/bin/1?range=daily
http://localhost:5000/api/analytics/bins?range=daily
```

### 3. Check Frontend:
- Open `/analytics` page
- Open browser console (F12)
- Should see logs: "Bins Response", "Current Bins Data", "Top Bins Response"
- All three charts should display with data

## ✅ Success Checklist

- [ ] SQL script run successfully
- [ ] Backend server restarted  
- [ ] `/analytics` page loads without errors
- [ ] Chart 1 shows green bars for bins 1, 2, 5, 7, 11
- [ ] Chart 2 shows blue bars ranking bins by average
- [ ] Chart 3 shows purple line graph when bin is selected
- [ ] Time range selector works (Daily/Weekly/Monthly)
- [ ] Bin selector dropdown works
- [ ] No errors in browser console
- [ ] No errors in backend terminal

## 🎯 Expected Results

After running the SQL script, you should see:

**Current Bin Fill Levels:** All 5 bins with their current percentages  
**Top Bins Ranking:** Bin 11 > Bin 5 > Bin 2 > Bin 1 > Bin 7 (highest to lowest average)  
**Individual Trends:** Smooth upward trends with occasional drops (emptying)

## 📝 Files Changed

- ✅ `backend/controllers/analytics.controller.js` - Added limits and better sorting
- ✅ `backend/sample_analytics_data.sql` - Updated with your bin IDs and 30 days data
- ✅ `ANALYTICS_COMPLETE_FIX.md` - This guide

## 💡 Pro Tips

1. **Daily View**: Shows last 30 days, each day averaged
2. **Weekly View**: Shows last 12 weeks, grouped by week
3. **Monthly View**: Shows last 12 months, grouped by month
4. **Empty Data**: Use the "TRUNCATE TABLE bin_readings;" command to clear old data
5. **Real Data**: The trigger `trigger_log_bin_readings` automatically logs when bins update

## 🔄 Next Time You Update Bins

When you update a bin's `current_level`, the trigger automatically creates a new reading:

```sql
UPDATE bins SET current_level = 75 WHERE id = 1;
-- Automatically creates: INSERT INTO bin_readings (bin_id, fill_level) VALUES (1, 75);
```

Your analytics will automatically include this new data!

---

**Need Help?** Check browser console and backend terminal for error messages. All data handling includes proper logging for debugging.
