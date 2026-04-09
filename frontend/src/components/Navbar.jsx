import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { admin, logoutAdmin } = useAuth();

  const handleLogout = () => {
    const confirmed = window.confirm("Do you want to logout?");
    if (confirmed) {
      logoutAdmin();
    }
  };

  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-emerald-100">
      <h1 className="text-xl font-bold text-emerald-700">Smart Garbage</h1>
      {admin && (
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="flex items-center gap-3 group rounded-full px-3 py-1.5 hover:bg-emerald-50 transition"
          >
            {admin.photo_url ? (
              <img
                src={admin.photo_url}
                alt={admin.name}
                className="h-10 w-10 rounded-full object-cover border border-emerald-200"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center border border-emerald-200">
                {admin.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
            <span className="text-emerald-800 font-medium group-hover:text-emerald-600">
              {admin.name}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}