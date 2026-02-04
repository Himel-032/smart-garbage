import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { getAllDrivers } from "../../api/drivers.js";

function DriverForm({ initialData, onSubmit, isLoading, isEditMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    status: "pending",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingEmails, setExistingEmails] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        password: "",
        confirmPassword: "",
        status: initialData.status || "pending",
        photo: null,
      });
      if (initialData.photo_url) {
        setPhotoPreview(initialData.photo_url);
      }
    }
  }, [initialData]);

  useEffect(() => {
    // Fetch all drivers to check for existing emails
    const fetchDrivers = async () => {
      try {
        const response = await getAllDrivers();
        const emails = response.data.map((driver) => driver.email.toLowerCase());
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    } else {
      // Check for duplicate email
      const emailLower = formData.email.toLowerCase();
      if (isEditMode) {
        // In edit mode, allow the current email
        if (
          initialData &&
          emailLower !== initialData.email.toLowerCase() &&
          existingEmails.includes(emailLower)
        ) {
          newErrors.email = "This email is already registered";
        }
      } else {
        // In create mode, check if email exists
        if (existingEmails.includes(emailLower)) {
          newErrors.email = "This email is already registered";
        }
      }
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isEditMode && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, photo: "Please select an image file" });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: "Image size should be less than 5MB" });
        return;
      }

      setFormData({ ...formData, photo: file });
      setErrors({ ...errors, photo: "" });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(initialData?.photo_url || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-emerald-500 shadow-lg">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                <User className="text-emerald-600" size={48} />
              </div>
            )}
          </div>
          {formData.photo && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <label className="mt-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <span className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            <Upload size={18} />
            Upload Photo
          </span>
        </label>
        {errors.photo && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.photo}
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            placeholder="Enter driver name"
          />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            placeholder="Enter email address"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Phone</label>
        <div className="relative">
          <Phone
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Password {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && (
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              (leave blank to keep current)
            </span>
          )}
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-12 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            placeholder={isEditMode ? "Enter new password" : "Enter password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      {(formData.password || !isEditMode) && (
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
            {isEditMode && (
              <span className="text-sm text-gray-500 font-normal">
                {" "}
                (required if changing password)
              </span>
            )}
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-2 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              placeholder="Re-enter password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>{isEditMode ? "Update Driver" : "Create Driver"}</>
        )}
      </button>
    </form>
  );
}

export default DriverForm;