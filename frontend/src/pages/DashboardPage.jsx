import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">
          Welcome to the Dashboard, {admin.name}!
        </h2>
        <p className="mb-4 font-bold text-gray-700">{admin.email}</p>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Admin Details</h3>
          <p>
            <strong>Name:</strong> {admin.name}
          </p>
          <p>
            <strong>Email:</strong> {admin.email}
          </p>
        </div>
      </div>
    </div>
  );
}
