import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAllDrivers } from "../api/drivers.js";
import { getAllBins } from "../api/bins.js";
import { getConversations } from "../api/messages.js";
import {
  Users,
  Trash2,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Activity,
  Package,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { admin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    pendingDrivers: 0,
    totalBins: 0,
    workingBins: 0,
    maintenanceBins: 0,
    fullBins: 0,
    assignedBins: 0,
    unassignedBins: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentDrivers, setRecentDrivers] = useState([]);
  const [recentBins, setRecentBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin) {
      fetchDashboardData();
    }
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [driversRes, binsRes, conversationsRes] = await Promise.all([
        getAllDrivers(),
        getAllBins(),
        getConversations().catch(() => ({ data: { data: [] } })),
      ]);

      const drivers = driversRes.data || [];
      const bins = binsRes.data || [];
      const conversations = conversationsRes.data?.data || [];

      // Calculate statistics
      const activeDrivers = drivers.filter((d) => d.status === "active").length;
      const pendingDrivers = drivers.filter((d) => d.status === "pending").length;
      const workingBins = bins.filter((b) => b.status === "working").length;
      const maintenanceBins = bins.filter((b) => b.status === "maintenance").length;
      const fullBins = bins.filter((b) => b.current_level >= b.capacity * 0.8).length;
      const assignedBins = bins.filter((b) => b.driver_id).length;
      const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

      setStats({
        totalDrivers: drivers.length,
        activeDrivers,
        pendingDrivers,
        totalBins: bins.length,
        workingBins,
        maintenanceBins,
        fullBins,
        assignedBins,
        unassignedBins: bins.length - assignedBins,
        totalMessages: conversations.length,
        unreadMessages,
      });

      // Get recent drivers (last 5)
      setRecentDrivers(drivers.slice(0, 5));
      
      // Get recent bins (last 5)
      setRecentBins(bins.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!admin) {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace("border-", "bg-").replace("600", "100")}`}>
          <Icon className={color.replace("border-", "text-")} size={28} />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {admin.name}!
              </h1>
              <p className="text-green-100">
                Here's what's happening with your smart garbage management system today.
              </p>
            </div>
            <Activity size={64} className="opacity-20" />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={Users}
            color="border-blue-600"
            subtitle={`${stats.activeDrivers} active, ${stats.pendingDrivers} pending`}
            onClick={() => navigate("/drivers")}
          />
          <StatCard
            title="Total Bins"
            value={stats.totalBins}
            icon={Trash2}
            color="border-green-600"
            subtitle={`${stats.assignedBins} assigned, ${stats.unassignedBins} unassigned`}
            onClick={() => navigate("/bins")}
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon={MessageCircle}
            color="border-purple-600"
            subtitle={`${stats.unreadMessages} unread`}
            onClick={() => navigate("/messages")}
          />
          <StatCard
            title="Full Bins"
            value={stats.fullBins}
            icon={AlertCircle}
            color="border-red-600"
            subtitle={`Requires attention`}
            onClick={() => navigate("/bins")}
          />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bins Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="text-green-600" size={24} />
              Bins Status Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium text-gray-700">Working</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {stats.workingBins}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600" size={20} />
                  <span className="font-medium text-gray-700">Maintenance</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {stats.maintenanceBins}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="font-medium text-gray-700">Nearly Full</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {stats.fullBins}
                </span>
              </div>
            </div>
          </div>

          {/* Drivers Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Drivers Status Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium text-gray-700">Active</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {stats.activeDrivers}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-600" size={20} />
                  <span className="font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {stats.pendingDrivers}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-700">Assigned Bins</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {stats.assignedBins}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/drivers/add")}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
            >
              <Users className="text-blue-600" size={32} />
              <span className="font-medium text-gray-700 text-sm">Add Driver</span>
            </button>
            <button
              onClick={() => navigate("/bins/add")}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition border border-green-200"
            >
              <Trash2 className="text-green-600" size={32} />
              <span className="font-medium text-gray-700 text-sm">Add Bin</span>
            </button>
            <button
              onClick={() => navigate("/map")}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition border border-purple-200"
            >
              <MapPin className="text-purple-600" size={32} />
              <span className="font-medium text-gray-700 text-sm">View Map</span>
            </button>
            <button
              onClick={() => navigate("/messages")}
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition border border-orange-200"
            >
              <MessageCircle className="text-orange-600" size={32} />
              <span className="font-medium text-gray-700 text-sm">Messages</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Drivers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Drivers</h3>
              <button
                onClick={() => navigate("/drivers")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentDrivers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No drivers yet</p>
              ) : (
                recentDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => navigate(`/drivers/detail/${driver.id}`)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {driver.photo_url ? (
                        <img
                          src={driver.photo_url}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {driver.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {driver.email}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        driver.status === "active"
                          ? "bg-green-100 text-green-800"
                          : driver.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bins */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Bins</h3>
              <button
                onClick={() => navigate("/bins")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentBins.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bins yet</p>
              ) : (
                recentBins.map((bin) => (
                  <div
                    key={bin.id}
                    onClick={() => navigate(`/bins/edit/${bin.id}`)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Trash2 className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {bin.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {bin.location || "No location"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs px-2 py-1 rounded-full ${
                          bin.status === "working"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {bin.status}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bin.current_level}/{bin.capacity}L
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
