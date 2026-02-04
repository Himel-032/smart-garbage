import React from  "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Package,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

function DriverList({ drivers, onEdit, onDelete, onAssignBins }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "inactive":
        return <XCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drivers.map((driver) => (
        <div
          key={driver.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* Header with Photo */}
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white relative cursor-pointer"
            onClick={() => navigate(`/drivers/detail/${driver.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                {driver.photo_url ? (
                  <img
                    src={driver.photo_url}
                    alt={driver.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="text-emerald-600" size={32} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{driver.name}</h3>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border mt-2 ${getStatusColor(
                    driver.status
                  )}`}
                >
                  {getStatusIcon(driver.status)}
                  {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={18} className="text-emerald-600" />
              <span className="text-sm">{driver.email}</span>
            </div>
            {driver.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-emerald-600" />
                <span className="text-sm">{driver.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700">
              <Package size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold">
                {driver.assigned_bins || 0} Bins Assigned
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/drivers/detail/${driver.id}`);
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-700 py-2 px-2 rounded-lg hover:bg-gray-100 transition text-xs font-medium"
            >
              <Eye size={18} />
              <span>View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignBins(driver.id);
              }}
              className="flex flex-col items-center justify-center gap-1 bg-emerald-50 text-emerald-700 py-2 px-2 rounded-lg hover:bg-emerald-100 transition text-xs font-medium"
              title="Assign Bins"
            >
              <Package size={18} />
              <span>Assign</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(driver.id);
              }}
              className="flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-700 py-2 px-2 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
              title="Edit Driver"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(driver.id);
              }}
              className="flex flex-col items-center justify-center gap-1 bg-red-50 text-red-700 py-2 px-2 rounded-lg hover:bg-red-100 transition text-xs font-medium"
              title="Delete Driver"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DriverList;