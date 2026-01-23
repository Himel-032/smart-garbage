import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import BinMap from "./BinMap.jsx";
import { getAllBins } from "../../api/bins.js";
import { Map, Trash2, AlertTriangle, CheckCircle, Wrench, RefreshCw } from "lucide-react";

const BinsMapPage = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const res = await getAllBins();
      setBins(res.data);
    } catch (err) {
      console.error("Failed to fetch bins:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: bins.length,
    available: bins.filter((b) => {
      const fillRatio = (b.current_level || 0) / (b.capacity || 100);
      return b.status !== "maintenance" && fillRatio < 0.5;
    }).length,
    almostFull: bins.filter((b) => {
      const fillRatio = (b.current_level || 0) / (b.capacity || 100);
      return b.status !== "maintenance" && fillRatio >= 0.8;
    }).length,
    maintenance: bins.filter((b) => b.status === "maintenance").length,
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Map className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Bins Map View</h2>
              <p className="text-gray-500 text-sm">
                Real-time location of all garbage bins
              </p>
            </div>
          </div>
          <button
            onClick={fetchBins}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Bins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.available}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.almostFull}</p>
                <p className="text-xs text-gray-500">Almost Full</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.maintenance}</p>
                <p className="text-xs text-gray-500">Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500"></span>
              <span className="text-sm text-gray-600">Available (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500"></span>
              <span className="text-sm text-gray-600">Half Full (50-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-600">Almost Full (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-500"></span>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <BinMap />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BinsMapPage;