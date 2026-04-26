import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  Loader2,
  Mail,
  Package,
  Trash2,
  User,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getDriverPerformance } from "../../api/drivers.js";

const getStatusBadge = (status) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "inactive":
      return "bg-red-100 text-red-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getBinFillStatus = (fillPercentage) => {
  if (fillPercentage >= 80) return { label: "Full", className: "bg-red-100 text-red-700" };
  if (fillPercentage >= 60) return { label: "High", className: "bg-orange-100 text-orange-700" };
  if (fillPercentage >= 35) return { label: "Medium", className: "bg-yellow-100 text-yellow-700" };
  if (fillPercentage >= 10) return { label: "Low", className: "bg-blue-100 text-blue-700" };
  return { label: "Empty", className: "bg-emerald-100 text-emerald-700" };
};

function DriverPerformancePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getDriverPerformance(id);
        setPerformance(res.data);
      } catch (err) {
        console.error("Error loading driver performance:", err);
        setError(err.response?.data?.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [id]);

  const chartData = useMemo(() => {
    if (!performance?.assignedBins) return [];
    return performance.assignedBins.map((bin) => ({
      name: bin.name,
      fill: Number(bin.fill_percentage) || 0,
    }));
  }, [performance]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Loading driver performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load performance</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!performance?.driver) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-gray-600">No performance data available</div>
      </DashboardLayout>
    );
  }

  const { driver, assignedBins, collectionsThisMonth, avgResponseTimeHours, binStatusSummary } =
    performance;

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen space-y-6">
        <div>
          <button
            onClick={() => navigate(`/drivers/detail/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Driver Detail</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Driver Performance</h1>
          <p className="text-gray-600 mt-1">Monthly collections and assigned bin performance overview</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
              {driver.photo_url ? (
                <img src={driver.photo_url} alt={driver.name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-gray-400" size={34} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(driver.status)}`}>
                  {driver.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={15} />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={15} />
                  <span>{driver.phone || "No phone"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{binStatusSummary?.total || 0}</p>
              </div>
              <Package className="text-emerald-600" size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Collections This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{collectionsThisMonth}</p>
              </div>
              <Trash2 className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {avgResponseTimeHours === null ? "N/A" : `${avgResponseTimeHours}h`}
                </p>
              </div>
              <Clock3 className="text-amber-600" size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Full Bins (&gt;=80%)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{binStatusSummary?.full || 0}</p>
              </div>
              <BarChart3 className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Bin Fill Percentage</h3>
          {assignedBins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bins assigned to this driver</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Fill"]} />
                  <Bar dataKey="fill" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Bins</h3>
          </div>

          {assignedBins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assigned bins found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Location</th>
                    <th className="text-left px-4 py-3 font-semibold">Current Volume</th>
                    <th className="text-left px-4 py-3 font-semibold">Capacity</th>
                    <th className="text-left px-4 py-3 font-semibold">Fill %</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedBins.map((bin) => {
                    const fill = Number(bin.fill_percentage) || 0;
                    const statusMeta = getBinFillStatus(fill);

                    return (
                      <tr key={bin.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{bin.name}</td>
                        <td className="px-4 py-3 text-gray-600">{bin.location || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-700">{bin.current_level || 0} L</td>
                        <td className="px-4 py-3 text-gray-700">{bin.capacity || 0} L</td>
                        <td className="px-4 py-3 text-gray-700">{fill.toFixed(2)}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DriverPerformancePage;
