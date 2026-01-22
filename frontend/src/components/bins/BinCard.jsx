import React from "react";
import { Trash2, MapPin, User, Droplets, Gauge,Edit2 } from "lucide-react";

const BinCard = ({ bin }) => {
  // Calculate fill percentage
  const fillPercentage = Math.round((bin.current_level / bin.capacity) * 100);

  // Determine status based on fill level
  const getStatus = () => {
    if (bin.status === "maintenance") return "maintenance";
    if (fillPercentage >= 80) return "critical";
    if (fillPercentage >= 50) return "warning";
    return "empty";
  };

  const status = getStatus();

  const statusConfig = {
    empty: {
      binColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      label: "Empty",
      labelBg: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      binColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      label: "Half Filled",
      labelBg: "bg-yellow-100 text-yellow-700",
    },
    critical: {
      binColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Critical",
      labelBg: "bg-red-100 text-red-700",
    },
    maintenance: {
      binColor: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      label: "Maintenance",
      labelBg: "bg-gray-100 text-gray-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`rounded-xl shadow-md border-2 ${config.borderColor} ${config.bgColor} overflow-hidden transition-all hover:shadow-lg`}
    >
      {/* Header with Bin Icon */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}
          >
            <Trash2 size={32} className={config.binColor} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{bin.name}</h2>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${config.labelBg}`}
            >
              {config.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${config.binColor}`}>
            {fillPercentage}%
          </p>
          <p className="text-xs text-gray-500">filled</p>
        </div>
      </div>

      {/* Fill Level Bar */}
      <div className="px-4 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              status === "critical"
                ? "bg-red-500"
                : status === "warning"
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
            }`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm">{bin.location || "No location set"}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} className="text-gray-400" />
          <span className="text-sm">
            {bin.driver_name ||
              (bin.driver_id ? `Driver #${bin.driver_id}` : "Unassigned")}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Droplets size={16} className="text-gray-400" />
            <span>
              {bin.current_level}L / {bin.capacity}L
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Gauge size={16} className="text-gray-400" />
            <span>Capacity: {bin.capacity}L</span>
          </div>
        </div>
      </div>
      {/* Edit & Delete Buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button
          
          className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-400 hover:bg-blue-600 text-white rounded-md transition"
        >
          <Edit2 size={16} /> Edit
        </button>
        <button
          
          className="flex-1 flex items-center justify-center gap-2 p-2 bg-orange-500 hover:bg-red-600 text-white rounded-md transition"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default BinCard;
