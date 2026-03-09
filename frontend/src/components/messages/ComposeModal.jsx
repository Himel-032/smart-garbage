import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchDrivers } from "../../api/messages.js";
import { X, Search, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ComposeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const delayDebounce = setTimeout(() => {
        fetchDrivers(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else if (isOpen) {
      fetchDrivers();
    }
  }, [searchTerm]);

  const fetchDrivers = async (search = "") => {
    try {
      setSearching(!!search);
      setLoading(true);
      const response = await searchDrivers(search);
      setDrivers(response.data.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSelectDriver = (driverId) => {
    navigate(`/messages/${driverId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search drivers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Drivers List */}
        <div className="flex-1 overflow-y-auto">
          {loading && !searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-12 text-center">
              <User size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                {searchTerm ? "No drivers found" : "No active drivers available"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => handleSelectDriver(driver.id)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex-shrink-0">
                    {driver.photo_url ? (
                      <img
                        src={driver.photo_url}
                        alt={driver.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={24} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {driver.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {driver.email}
                    </p>
                    {driver.phone && (
                      <p className="text-xs text-gray-500">{driver.phone}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {driver.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
