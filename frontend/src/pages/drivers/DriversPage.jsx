import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import { getAllDrivers, deleteDriver } from "../../api/drivers.js";
import DriverList from "../../components/drivers/DriverList.jsx";
import AssignBinsModal from "../../components/drivers/AssignBinsModal.jsx";
import { Plus, Search, UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const DriversPage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllDrivers();
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver(id);
        toast.success("Driver deleted successfully");
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        toast.error(error.response?.data?.message || "Failed to delete driver");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/drivers/edit/${id}`);
  };

  const handleAssignBins = (driverId) => {
    setSelectedDriverId(driverId);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    setIsAssignModalOpen(false);
    setSelectedDriverId(null);
    fetchDrivers();
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <UserPlus className="text-emerald-600" size={32} />
              Driver Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your drivers and assign bins
            </p>
          </div>
          <button
            onClick={() => navigate("/drivers/add")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition shadow-md"
          >
            <Plus size={20} />
            Add New Driver
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="text-gray-600 text-sm">Total Drivers</div>
            <div className="text-2xl font-bold text-gray-800">{drivers.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-gray-600 text-sm">Active Drivers</div>
            <div className="text-2xl font-bold text-gray-800">
              {drivers.filter((d) => d.status === "active").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="text-gray-600 text-sm">Pending</div>
            <div className="text-2xl font-bold text-gray-800">
              {drivers.filter((d) => d.status === "pending").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="text-gray-600 text-sm">Inactive</div>
            <div className="text-2xl font-bold text-gray-800">
              {drivers.filter((d) => d.status === "inactive").length}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Drivers List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserPlus className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No drivers found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by adding your first driver"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => navigate("/drivers/add")}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Add First Driver
              </button>
            )}
          </div>
        ) : (
          <DriverList
            drivers={filteredDrivers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssignBins={handleAssignBins}
          />
        )}

        {/* Assign Bins Modal */}
        {isAssignModalOpen && (
          <AssignBinsModal
            driverId={selectedDriverId}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedDriverId(null);
            }}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriversPage;
