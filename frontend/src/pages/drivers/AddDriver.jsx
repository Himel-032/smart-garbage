import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import DriverForm from "../../components/drivers/DriverForm.jsx";
import { createDriver } from "../../api/drivers.js";
import { ArrowLeft, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

function AddDriver() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      // Create FormData for file upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("status", formData.status);
      
      if (formData.phone) {
        data.append("phone", formData.phone);
      }
      
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      await createDriver(data);
      toast.success("Driver created successfully!");
      navigate("/drivers");
    } catch (error) {
      console.error("Error creating driver:", error);
      toast.error(
        error.response?.data?.message || "Failed to create driver"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            <UserPlus className="text-emerald-600" size={32} />
            Add New Driver
          </h1>
          <p className="text-gray-600 mt-1">
            Create a new driver account and assign responsibilities
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <DriverForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditMode={false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AddDriver;