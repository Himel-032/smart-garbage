import {
  LayoutDashboard,
  Users,
  Trash2,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Sidebar({ onToggle }) {
  const { logoutAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    const confirmed = window.confirm("Do you want to logout?");
    if (confirmed) {
      logoutAdmin();
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) onToggle(!isExpanded);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/dashboard",
    },
    { name: "Drivers", icon: <Users size={20} />, link: "#" },
    { name: "Trash Bins", icon: <Trash2 size={20} />, link: "/bins" },
    {name: "Map View", icon: <MapPin size={20} />, link: "/map"},
    { name: "Analytics", icon: <BarChart3 size={20} />, link: "#" },
    { name: "Settings", icon: <Settings size={20} />, link: "#" },
  ];

  return (
    <aside
      className={`h-screen ${
        isExpanded ? "w-64" : "w-16"
      } bg-emerald-900 text-emerald-100 fixed left-0 top-0 flex flex-col z-50 transition-all duration-300`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-4 border-b border-emerald-800">
        {isExpanded && (
          <div className="flex items-center gap-2">
            {/* Logo/Icon */}
            <Trash2 className="text-white" size={28} />
            <span className="font-bold text-lg mr-3">Smart Garbage</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-emerald-800 rounded-lg transition"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.link}
            onClick={(e) => {
              if (item.link === "#") {
                e.preventDefault();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition
              ${isActive && item.link !== "#" ? "bg-emerald-700 text-white" : "hover:bg-emerald-800"}`
            }
            title={!isExpanded ? item.name : ""}
          >
            <span className="shrink-0">{item.icon}</span>
            {isExpanded && (
              <span className="whitespace-nowrap overflow-hidden">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-emerald-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
          title={!isExpanded ? "Logout" : ""}
        >
          <span className="shrink-0">
            <LogOut size={20} />
          </span>
          {isExpanded && (
            <span className="whitespace-nowrap overflow-hidden">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}