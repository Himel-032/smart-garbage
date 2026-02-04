import React, { useState, useEffect } from "react";
import { X, Package, MapPin, CheckSquare, Square, Loader2 } from "lucide-react";
import { getAllUnassignedBins } from "../../api/bins.js";
import { getDriverById, assignBins } from "../../api/drivers.js";
import toast from "react-hot-toast";

function AssignBinsModal({ driverId, onClose, onSuccess }) {
  const [unassignedBins, setUnassignedBins] = useState([]);
  const [currentBins, setCurrentBins] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [driverName, setDriverName] = useState("");

  useEffect(() => {
    fetchData();
  }, [driverId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [unassignedResponse, driverResponse] = await Promise.all([
        getAllUnassignedBins(),
        getDriverById(driverId),
      ]);

      setUnassignedBins(unassignedResponse.data);
      setDriverName(driverResponse.data.name);

      // Get current bins assigned to this driver
      const currentDriverBins = driverResponse.data.bins || [];
      const validBins = currentDriverBins.filter(bin => bin !== null && bin.id);
      setCurrentBins(validBins);
      
      // Pre-select current bins
      setSelectedBins(validBins.map((bin) => bin.id));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load bins data");
    } finally {
      setLoading(false);
    }
  };

  const toggleBinSelection = (binId) => {
    setSelectedBins((prev) =>
      prev.includes(binId)
        ? prev.filter((id) => id !== binId)
        : [...prev, binId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedBins.length === 0) {
      toast.error("Please select at least one bin");
      return;
    }

    try {
      setSubmitting(true);
      await assignBins({ id: driverId, bins: selectedBins });
      toast.success("Bins assigned successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error assigning bins:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign bins"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const allBins = [...currentBins, ...unassignedBins];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package size={28} />
              Assign Bins
            </h2>
            <p className="text-emerald-100 mt-1">
              Assign bins to {driverName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-700 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
          ) : allBins.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No bins available
              </h3>
              <p className="text-gray-500">
                All bins are currently assigned or no bins exist in the system
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Select bins to assign ({selectedBins.length} selected)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBins.length === allBins.length) {
                      setSelectedBins([]);
                    } else {
                      setSelectedBins(allBins.map((bin) => bin.id));
                    }
                  }}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  {selectedBins.length === allBins.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allBins.map((bin) => {
                  const isSelected = selectedBins.includes(bin.id);
                  const isCurrent = currentBins.some((b) => b.id === bin.id);

                  return (
                    <div
                      key={bin.id}
                      onClick={() => toggleBinSelection(bin.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isSelected ? (
                            <CheckSquare className="text-emerald-600" size={24} />
                          ) : (
                            <Square className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">
                              {bin.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Currently Assigned
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin size={14} />
                            {bin.location}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ID: {bin.id} • Capacity: {bin.capacity}L
                          </div>
                          {bin.latitude && bin.longitude && (
                            <div className="text-xs text-gray-400 mt-1">
                              Lat: {bin.latitude}, Long: {bin.longitude}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || selectedBins.length === 0}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Assigning...
              </>
            ) : (
              "Assign Bins"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignBinsModal;