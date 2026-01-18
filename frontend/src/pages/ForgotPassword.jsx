import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email }, { withCredentials: true });
            setMessage(res.data.message);
        } catch(err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Error sending reset link');
        } finally{
            setLoading(false);
        }
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">
            Forgot Password
          </h2>
          {error && (
            <p className="text-sm text-center mb-4 text-red-600">{error}</p>
          )}
          {message && (
            <p className="text-sm text-center mb-4 text-blue-600">{message}</p>
          )}
          <input
            type="email"
            className="w-full border p-3 rounded mb-4"
            placeholder="Enter email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-center mt-4 text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    );

    
}
export default ForgotPassword;