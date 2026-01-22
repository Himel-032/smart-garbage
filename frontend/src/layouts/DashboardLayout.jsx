import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Sidebar */}
      <Sidebar onToggle={setIsSidebarExpanded} />

      {/* Main Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? "ml-64" : "ml-16"
        }`}
      >
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
