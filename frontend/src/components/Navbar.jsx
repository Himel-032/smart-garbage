
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Navbar() {
    const { admin, logoutAdmin } = useAuth();

    const handleLogout = () => {
        const confirmed = window.confirm('Do you want to logout?');
        if (confirmed) {
            logoutAdmin();
        }
    };

    return (
        <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="font-bold">Smart Garbage Dashboard</h1>
      {admin && (
        <div className="flex items-center gap-4">
          <span>{admin.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
    );

}