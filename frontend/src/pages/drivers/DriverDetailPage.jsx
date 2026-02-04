import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getDriverById, deleteDriver } from "../../api/drivers.js";
import AssignBinsModal from "../../components/drivers/AssignBinsModal.jsx";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Package,
  Edit,
  Trash2,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Shield,
  IdCard,
  Truck,
  Award,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const response = await getDriverById(id);
      setDriver(response.data);
    } catch (error) {
      console.error("Error fetching driver:", error);
      toast.error("Failed to load driver details");
      navigate("/drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver(id);
        toast.success("Driver deleted successfully");
        navigate("/drivers");
      } catch (error) {
        console.error("Error deleting driver:", error);
        toast.error(error.response?.data?.message || "Failed to delete driver");
      }
    }
  };

  const handleAssignSuccess = () => {
    setIsAssignModalOpen(false);
    fetchDriver();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: <CheckCircle size={20} />,
        };
      case "inactive":
        return {
          color: "bg-red-100 text-red-800 border-red-300",
          icon: <XCircle size={20} />,
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: <Clock size={20} />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: null,
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700">
              Driver not found
            </h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(driver.status);
  const validBins = driver.bins?.filter(bin => bin !== null && bin.id) || [];

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/drivers")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Drivers</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
              <p className="text-gray-600 mt-1">View and manage driver information</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-emerald-600 p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white p-1 shadow-lg">
                  {driver.photo_url ? (
                    <img
                      src={driver.photo_url}
                      alt={driver.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="text-gray-400" size={40} />
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">{driver.name}</h2>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white">
                  {statusConfig.icon}
                  <span>{driver.status.toUpperCase()}</span>
                </div>
                
                <div className="mt-4 text-emerald-100 text-sm">
                  ID: #{String(driver.id).padStart(4, '0')}
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{validBins.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Assigned Bins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.floor((new Date() - new Date(driver.created_at)) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Days Active</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => navigate(`/drivers/edit/${id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                  <Package size={18} />
                  Assign Bins
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <Trash2 size={18} />
                  Delete Driver
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-green-500">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-emerald-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{driver.email}</p>
                    </div>
                  </div>

                  {driver.phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{driver.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-green-500">
                <h3 className="text-lg font-semibold text-gray-900">Service Timeline</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Joined Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(driver.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(driver.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Bins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Bins</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{validBins.length} bin(s) assigned</p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                >
                  <Package size={16} />
                  Manage
                </button>
              </div>

              <div className="p-6">
                {validBins.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto text-gray-300 mb-3" size={48} />
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">No bins assigned</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      This driver doesn't have any bins assigned yet
                    </p>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                    >
                      <Package size={16} />
                      Assign Bins
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validBins.map((bin) => (
                      <div
                        key={bin.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/bins`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Package className="text-emerald-600" size={16} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{bin.name}</h4>
                              <p className="text-xs text-gray-500">ID: {String(bin.id).padStart(4, '0')}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              bin.status === "full"
                                ? "bg-red-100 text-red-700"
                                : bin.status === "empty"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {bin.status?.toUpperCase() || 'OK'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="truncate">{bin.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 rounded px-2 py-1.5">
                            <span className="text-gray-500">Capacity: </span>
                            <span className="font-semibold text-gray-900">{bin.capacity}L</span>
                          </div>
                          <div className="bg-gray-50 rounded px-2 py-1.5">
                            <span className="text-gray-500">Level: </span>
                            <span className="font-semibold text-gray-900">{bin.current_level || 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Bins Modal */}
        {isAssignModalOpen && (
          <AssignBinsModal
            driverId={parseInt(id)}
            onClose={() => setIsAssignModalOpen(false)}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default DriverDetailPage;
