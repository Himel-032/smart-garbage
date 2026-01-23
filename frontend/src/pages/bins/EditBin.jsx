import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getBinById, updateBin } from "../../api/bins.js";
import { getAllDrivers } from "../../api/drivers.js";
import { 
  Trash2, 
  MapPin, 
  User, 
  Gauge, 
  ArrowLeft, 
  MapPinned, 
  CheckCircle,
  Settings,
  Save,
  X,
  Loader2
} from "lucide-react";

const EditBin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    driver_id: "",
    capacity: "",
    status: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    console.log("Fetching bin data for ID:", id);
    const fetchData = async () => {
      try {
        
        const binResponse = await getBinById(id);
        const driversResponse = await getAllDrivers();
        const bin = binResponse.data.bin;
        setForm({
          name: bin.name,
          location: bin.location,
          driver_id: bin.driver_id || "",
          capacity: bin.capacity,
          status: bin.status,
          latitude: bin.latitude,
          longitude: bin.longitude,
        });
        setDrivers(driversResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load bin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "latitude" && (value < -90 || value > 90)){
        setError("Latitude must be between -90 and 90.");
        return;
    }
    if (name === "longitude" && (value < -180 || value > 180)){
        setError("Longitude must be between -180 and 180.");
        return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateBin(id, {
        ...form,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        capacity: Number(form.capacity),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/bins");
      }, 1500);
    } catch (err) {
      console.error("Error updating bin:", err);
      setError(err.response?.data?.message || "Failed to update bin. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="text-emerald-600 animate-spin" size={32} />
            </div>
            <p className="text-gray-500">Loading bin data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success State
  if (success) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bin Updated Successfully!</h2>
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
          <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Settings className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Garbage Bin</h2>
                <p className="text-blue-100">Update bin details and settings</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <X size={18} />
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
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter bin name"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Capacity (Liters) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Gauge size={18} />
                    </span>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                  Location Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={18} />
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., Central Park, Main Street"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPinned size={18} />
                    </span>
                    <input
                      type="text"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="e.g., 22.8989600"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPinned size={18} />
                    </span>
                    <input
                      type="text"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="e.g., 89.5050600"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Assignment Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Status & Assignment
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bin Status
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Settings size={18} />
                    </span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none cursor-pointer"
                    >
                      <option value="working">✅ Working</option>
                      <option value="maintenance">🔧 Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assign Driver
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User size={18} />
                    </span>
                    <select
                      name="driver_id"
                      value={form.driver_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none cursor-pointer"
                    >
                      <option value="">-- Unassigned --</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} {` ( ID: ${driver.id})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/bins")}
                className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Update Bin</span>
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

export default EditBin;