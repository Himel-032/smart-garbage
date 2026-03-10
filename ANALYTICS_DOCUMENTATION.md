# Analytics Feature Documentation

## Overview
The Analytics Dashboard provides comprehensive visualizations for tracking and analyzing bin fill levels across your smart garbage management system.

## Charts Implemented

### 1. **Bar Chart - Top Bins by Average Fill Level**
- **Purpose**: Displays the top 10 bins with the highest average fill levels
- **Use Case**: Quickly identify bins that fill up most frequently
- **Data Source**: `/api/analytics/top?top=10`
- **Visualization**: Vertical bar chart showing bin names vs. average fill percentage
- **Color**: Green (#16a34a)

### 2. **Area Chart - All Bins Combined Trend**
- **Purpose**: Shows the overall trend of average fill levels across all bins
- **Use Case**: Monitor system-wide performance and identify patterns
- **Data Source**: `/api/analytics/bins?range={daily|weekly|monthly}`
- **Visualization**: Area chart with gradient fill
- **Color**: Blue (#3b82f6)
- **Controls**: Time range selector (Daily/Weekly/Monthly)

### 3. **Line Chart - Individual Bin Trend**
- **Purpose**: Track fill level trends for a specific bin over time
- **Use Case**: Monitor individual bin performance and predict maintenance needs
- **Data Source**: `/api/analytics/bin/:binId?range={daily|weekly|monthly}`
- **Visualization**: Line chart with data points
- **Color**: Purple (#9333ea)
- **Controls**: 
  - Bin selector dropdown
  - Time range selector (Daily/Weekly/Monthly)

## Features

### Time Range Options
- **Daily**: Shows data grouped by day
- **Weekly**: Shows data grouped by week
- **Monthly**: Shows data grouped by month

### Interactive Elements
- **Tooltips**: Hover over any data point to see exact values
- **Legend**: Toggle visibility of data series
- **Responsive Design**: Adapts to different screen sizes
- **Real-time Updates**: Automatically fetches latest data

## Installation

### Prerequisites
You need to install the Recharts library for data visualization:

```bash
cd frontend
npm install recharts
```

## API Endpoints

### Backend Endpoints
1. `GET /api/analytics/bin/:binId?range={daily|weekly|monthly}`
   - Get analytics for a single bin
   
2. `GET /api/analytics/bins?range={daily|weekly|monthly}`
   - Get analytics for all bins combined
   
3. `GET /api/analytics/top?top=N`
   - Get top N bins by average fill level

### Frontend API Functions
Located in `frontend/src/api/analytics.js`:
- `getBinAnalytics(binId, range)`
- `getAllBinsAnalytics(range)`
- `getTopBinsAnalytics(top)`

## Navigation

Access the Analytics Dashboard through:
- **Sidebar Menu**: Click on "Analytics" in the left sidebar
- **Direct URL**: `/analytics`

## Database Requirements

The analytics feature requires the `bin_readings` table with the following structure:

```sql
CREATE TABLE bin_readings (
  id SERIAL PRIMARY KEY,
  bin_id INTEGER REFERENCES bins(id),
  fill_level DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Sample Data

To test the analytics, ensure you have:
1. Bins created in the `bins` table
2. Sample readings in the `bin_readings` table

Example insert:
```sql
INSERT INTO bin_readings (bin_id, fill_level, recorded_at)
VALUES 
  (1, 45.5, NOW() - INTERVAL '1 day'),
  (1, 67.8, NOW() - INTERVAL '2 days'),
  (2, 80.2, NOW() - INTERVAL '1 day');
```

## Troubleshooting

### No Data Showing
1. Check if bins exist in the database
2. Verify bin_readings table has data
3. Check browser console for API errors
4. Ensure backend server is running

### Charts Not Rendering
1. Verify Recharts is installed: `npm list recharts`
2. Check browser console for errors
3. Ensure data format is correct (numbers, not strings)

### Time Range Not Working
1. Verify the range parameter is being passed to API
2. Check backend console for SQL errors
3. Ensure PostgreSQL DATE_TRUNC function is supported

## Future Enhancements

Potential improvements:
- Export charts as images (PNG/PDF)
- Comparison view (compare multiple bins)
- Predictive analytics (forecast when bins will be full)
- Alert thresholds (notify when fill level exceeds limit)
- Custom date range picker
- Download data as CSV/Excel
- Real-time updates using WebSocket

## Technical Stack

- **Frontend**: React 19, Recharts
- **Backend**: Express.js, PostgreSQL
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Files Created/Modified

### New Files
1. `frontend/src/api/analytics.js` - API functions
2. `frontend/src/pages/AnalyticsPage.jsx` - Main analytics page component
3. `ANALYTICS_DOCUMENTATION.md` - This documentation

### Modified Files
1. `frontend/src/App.jsx` - Added analytics route
2. `frontend/src/components/Sidebar.jsx` - Updated analytics link

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint responses
3. Check browser and server console logs
