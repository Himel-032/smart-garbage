import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import DriverForm from "../../components/drivers/DriverForm.jsx";
import { getDriverById, updateDriver } from "../../api/drivers.js";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function EditDriver() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [driverData, setDriverData] = useState(null);

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      setIsFetching(true);
      const response = await getDriverById(id);
      setDriverData(response.data);
    } catch (error) {
      console.error("Error fetching driver:", error);
      toast.error("Failed to load driver data");
      navigate("/drivers");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      // Create FormData for file upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("status", formData.status);
      
      if (formData.phone) {
        data.append("phone", formData.phone);
      }
      
      if (formData.password) {
        data.append("password", formData.password);
      }
      
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      await updateDriver(id, data);
      toast.success("Driver updated successfully!");
      navigate("/drivers");
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error(
        error.response?.data?.message || "Failed to update driver"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/drivers")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Drivers
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="text-emerald-600" size={32} />
            Edit Driver
          </h1>
          <p className="text-gray-600 mt-1">
            Update driver information and settings
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <DriverForm
            initialData={driverData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditMode={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditDriver;