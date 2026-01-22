import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer.jsx";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Sidebar */}
      <Sidebar onToggle={setIsSidebarExpanded} />

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarExpanded ? "ml-64" : "ml-16"
        }`}
      >
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
