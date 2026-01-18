import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
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
            await axios.get(`http://localhost:5000/api/auth/validate-reset-token/${token}`, { withCredentials: true });
            setValidating(false);
        } catch (err) {
            setError('Invalid or expired token');
            setValidating(false);
            setTimeout(() => navigate("/login"), 3000);
        }
    };
    validateToken();
  }, [token, navigate]);

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
    // if password length is less than 6
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword:password },
        { withCredentials: true },
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Validating reset link...</p>
      </div>
    );
  }

  // Show error if token invalid
  if (error && !password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to forgot password...</p>
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline mt-4 block"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h2>
        {error && (
          <p className="text-sm text-center mb-4 text-red-600">{error}</p>
        )}
        {message && (
          <p className="text-sm text-center mb-4 text-blue-600">{message}</p>
        )}

        <input
          type="password"
          placeholder="New password"
          className="w-full border p-3 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full border p-3 rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;