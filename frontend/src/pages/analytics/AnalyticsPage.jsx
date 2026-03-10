import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getBinAnalytics, getAllBinsAnalytics, getTopBinsAnalytics } from "../../api/analytics";
import { getAllBins } from "../../api/bins";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3, Activity, AlertCircle } from "lucide-react";

const AnalyticsPage = () => {
  const [currentBinsData, setCurrentBinsData] = useState([]);
  const [topBinsData, setTopBinsData] = useState([]);
  const [selectedBinData, setSelectedBinData] = useState([]);
  const [bins, setBins] = useState([]);
  const [selectedBinId, setSelectedBinId] = useState("");
  const [range, setRange] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get color based on fill level (matching BinCard)
  const getBarColor = (fillPercentage) => {
    if (fillPercentage >= 80) return "#ef4444"; // red-500 (critical)
    if (fillPercentage >= 50) return "#eab308"; // yellow-500 (warning)
    return "#10b981"; // emerald-500 (empty/good)
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (range && selectedBinId) {
      fetchBinData(selectedBinId);
    }
  }, [range, selectedBinId]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch bins list
      const binsResponse = await getAllBins();
      console.log("Bins API Response:", binsResponse);
      console.log("Bins Data:", binsResponse.data);
      
      // Handle response - bins.controller returns array directly
      const binsArray = Array.isArray(binsResponse.data) ? binsResponse.data : binsResponse.data?.bins || [];
      
      if (!binsArray || binsArray.length === 0) {
        setError("No bins found. Please add bins first.");
        setLoading(false);
        return;
      }
      
      console.log("Bins Array:", binsArray);
      setBins(binsArray);

      // Create current bins data from bins list
      // const currentData = binsArray.map((bin) => ({
      //   id: bin.id,
      //   name: bin.name || `Bin ${bin.id}`,
      //   currentLevel: Number(bin.current_level) || 0,
      //   capacity: Number(bin.capacity) || 100,
      //   fillPercentage: bin.capacity > 0 
      //     ? Number(((bin.current_level / bin.capacity) * 100).toFixed(2))
      //     : 0
      // }));
      const currentData = binsArray.map((bin) => ({
        id: bin.id,
        name: bin.name || `Bin ${bin.id}`,
        currentLevel: Number(bin.current_level) || 0,
        capacity: Number(bin.capacity) || 100,
        fillPercentage:
          bin.capacity > 0
            ? Number((bin.current_level ).toFixed(2))
            : 0,
      }));
      
      console.log("Current Bins Data:", currentData);
      setCurrentBinsData(currentData);

      // Fetch top bins by average historical data
      await fetchTopBins();

      // Select first bin for trend view
      if (binsArray.length > 0) {
        const firstBinId = binsArray[0].id;
        setSelectedBinId(firstBinId);
        await fetchBinData(firstBinId);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError(error.message || "Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopBins = async () => {
    try {
      const response = await getTopBinsAnalytics(10);
      console.log("Top Bins API Response:", response);
      console.log("Top Bins Data:", response.data);
      
      // Response.data is the data payload from backend
      const dataArray = response.data?.data || response.data || [];
      
      if (!dataArray || dataArray.length === 0) {
        console.log("No historical data available for top bins");
        setTopBinsData([]);
        return;
      }
      
      const formattedData = dataArray.map((item) => ({
        name: item.bin_name || `Bin ${item.bin_id}`,
        binId: item.bin_id,
        avgFill: Number(item.avg_fill) || 0,
      }));
      
      console.log("Formatted Top Bins:", formattedData);
      setTopBinsData(formattedData);
    } catch (error) {
      console.error("Error fetching top bins:", error);
      setTopBinsData([]);
    }
  };

  const fetchBinData = async (binId) => {
    try {
      const response = await getBinAnalytics(binId, range);
      console.log(`Bin ${binId} Analytics (${range}) API Response:`, response);
      console.log("Bin Analytics Data:", response.data);
      
      // Response.data is the data payload from backend
      const dataArray = response.data?.data || response.data || [];
      
      if (!dataArray || dataArray.length === 0) {
        console.log(`No historical data for bin ${binId} in ${range} view`);
        setSelectedBinData([]);
        return;
      }
      
      const formattedData = dataArray.map((item) => ({
        date: formatDate(item.period),
        rawDate: item.period,
        fill: Number(item.fill) || 0,
      }));
      
      console.log("Formatted Bin Data:", formattedData);
      setSelectedBinData(formattedData);
    } catch (error) {
      console.error("Error fetching bin data:", error);
      setSelectedBinData([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (range === "daily") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (range === "weekly") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  };

  const handleBinChange = (e) => {
    const binId = e.target.value;
    setSelectedBinId(binId);
    if (binId) {
      fetchBinData(binId);
    }
  };

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const color = getBarColor(value);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p style={{ color: color }}>
            {payload[0].name}: {value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const NoDataMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <AlertCircle className="w-12 h-12 mb-2" />
      <p className="text-lg">{message}</p>
      <p className="text-sm mt-1">Data will appear once bin readings are recorded</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4 text-red-600">
            <AlertCircle className="w-16 h-16" />
            <p className="text-xl font-semibold">{error}</p>
            <button
              onClick={fetchInitialData}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track and analyze bin fill levels in real-time</p>
          </div>

          {/* Range Selector for Trend Charts */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Trend Range:</label>
            <select
              value={range}
              onChange={handleRangeChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Current Bins Status - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Current Bin Fill Levels</h2>
            <span className="text-sm text-gray-500 ml-2">(Real-time Status)</span>
          </div>
          
          {currentBinsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentBinsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis 
                  label={{ value: "Fill Level (%)", angle: -90, position: "insideLeft" }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="fillPercentage" 
                  name="Current Fill Level (%)"
                  radius={[8, 8, 0, 0]}
                >
                  {currentBinsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.fillPercentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No bins available" />
          )}
        </div>

        {/* Top Bins by Historical Average - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Top Bins by Average Fill Level</h2>
            <span className="text-sm text-gray-500 ml-2">(Historical Data)</span>
          </div>
          
          {topBinsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topBinsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis 
                  label={{ value: "Average Fill Level (%)", angle: -90, position: "insideLeft" }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="avgFill" 
                  name="Average Fill (%)"
                  radius={[8, 8, 0, 0]}
                >
                  {topBinsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.avgFill)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No historical data available" />
          )}
        </div>

        {/* Individual Bin Trend - Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Individual Bin Trend</h2>
              <span className="text-sm text-gray-500 ml-2">({range.charAt(0).toUpperCase() + range.slice(1)} View)</span>
            </div>
            
            {/* Bin Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Select Bin:</label>
              <select
                value={selectedBinId}
                onChange={handleBinChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Choose a bin...</option>
                {bins.map((bin) => (
                  <option key={bin.id} value={bin.id}>
                    {bin.name || `Bin ${bin.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedBinId && selectedBinData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={selectedBinData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                />
                <YAxis 
                  label={{ value: "Fill Level (%)", angle: -90, position: "insideLeft" }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fill"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#9333ea" }}
                  activeDot={{ r: 7 }}
                  name="Fill Level (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : selectedBinId ? (
            <NoDataMessage message={`No historical data for this bin in ${range} view`} />
          ) : (
            <NoDataMessage message="Please select a bin to view trends" />
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">About Analytics</h3>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Current Bin Fill Levels:</strong> Shows real-time current fill status of all bins.
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Top Bins by Average:</strong> Historical average calculated from bin readings.
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Individual Bin Trend:</strong> Historical fill level trends over time (daily/weekly/monthly).
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
