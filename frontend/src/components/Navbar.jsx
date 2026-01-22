import { useAuth } from "../context/AuthContext";

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
          <span className="text-emerald-800 font-medium">{admin.name}</span>
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