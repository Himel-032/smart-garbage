import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const DriverResetPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.get(
          `${API_URL}api/drivers/validate-reset-token/${token}`,
          { withCredentials: true },
        );
        setValidating(false);
      } catch (err) {
        setError('Invalid or expired token');
        setValidating(false);
        //setTimeout(() => navigate("/driver/forgot-password"), 3000);
      }
    };
    validateToken();
  }, [token, navigate, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${API_URL}api/drivers/reset-password/${token}`,
        { newPassword: password },
        { withCredentials: true },
      );
      setMessage(res.data.message);
      //setTimeout(() => navigate("/driver/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token invalid
  if (error && !password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {/* <p className="text-gray-600">Redirecting to forgot password...</p>
          <Link
            to="/driver/forgot-password"
            className="text-blue-600 hover:underline mt-4 block font-medium"
          >
            Request a new reset link
          </Link> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Reset Your Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below
        </p>
        {error && (
          <p className="text-sm text-center mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">{error}</p>
        )}
        {message && (
          <p className="text-sm text-center mb-4 p-3 bg-green-50 text-green-600 rounded border border-green-200">{message}</p>
        )}

        <input
          type="password"
          placeholder="New password"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default DriverResetPassword;
