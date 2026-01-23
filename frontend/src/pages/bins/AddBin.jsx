import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDrivers } from "../../api/drivers.js";
import { addBin } from "../../api/bins.js";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { Trash2, MapPin, User, Gauge, ArrowLeft, MapPinned, CheckCircle } from "lucide-react";

const AddBin = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    driver_id: "",
    capacity: 100,
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDrivers();
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
     if (name === "latitude" && (value < -90 || value > 90)) {
       setError("Latitude must be between -90 and 90.");
       return;
     }
     if (name === "longitude" && (value < -180 || value > 180)) {
       setError("Longitude must be between -180 and 180.");
       return;
     }
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name.trim()) {
      setError("Bin name is required");
      setLoading(false);
      return;
    }

    try {
      await addBin({
        ...formData,
        driver_id: formData.driver_id ? Number(formData.driver_id) : null,
        capacity: Number(formData.capacity),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/bins");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add bin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bin Added Successfully!</h2>
            <p className="text-gray-500">Redirecting to bins list...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/bins")}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Bins</span>
        </button>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Trash2 className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Garbage Bin</h2>
                <p className="text-emerald-100">Fill in the details to register a new bin</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Bin Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bin Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Trash2 size={18} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter bin name"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Capacity (Liters)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Gauge size={18} />
                    </span>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Location Details
              </h3>
              
              {/* Location Description */}
              <div className="space-y-1 mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Location Description
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={18} />
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Central Park, Main Street"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Latitude
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPinned size={18} />
                    </span>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g., 22.8989600"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Longitude
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPinned size={18} />
                    </span>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g., 89.5050600"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Driver Assignment
              </h3>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Assign Driver (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </span>
                  <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none cursor-pointer"
                  >
                    <option value="">-- Select a Driver --</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding Bin...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    <span>Add Bin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddBin;
