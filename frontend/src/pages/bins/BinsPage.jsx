import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBins, deleteBin } from "../../api/bins.js";
import BinCard from "../../components/bins/BinCard.jsx";
import Button from "../../components/bins/Button.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";

const BinsPage = () => {
  const [bins, setBins] = useState([]);
  const [displayedBins, setDisplayedBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();

  const fetchBins = async () => {
    try {
      setLoading(true);
      const res = await getAllBins();
      setBins(res.data);
      setDisplayedBins(res.data.slice(0, 4)); // Show only first 4 initially
    } catch (err) {
      console.error("Error fetching bins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const getFillStatus = (bin) => {
    const capacity = Number(bin.capacity) || 0;
    const currentLevel = Number(bin.current_level) || 0;

    if (capacity <= 0) {
      return "available";
    }

    const fillPercentage = (currentLevel / capacity) * 100;

    if (fillPercentage >= 80) {
      return "critical";
    }

    if (fillPercentage >= 50) {
      return "half-filled";
    }

    return "available";
  };

  // Handle search and filter
  useEffect(() => {
    let filtered = bins;

    if (search) {
      filtered = filtered.filter((bin) =>
        bin.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filterLocation) {
      filtered = filtered.filter(
        (bin) =>
          (bin.location || "").toLowerCase() === filterLocation.toLowerCase(),
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((bin) => getFillStatus(bin) === filterStatus);
    }

    setFilteredCount(filtered.length);

    if (showAll) {
      setDisplayedBins(filtered);
    } else {
      setDisplayedBins(filtered.slice(0, 4));
    }
  }, [search, filterLocation, filterStatus, showAll, bins]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
      try {
        await deleteBin(id);
        fetchBins();
      } catch (err) {
        console.error("Error deleting bin:", err);
        alert("Failed to delete bin. Please try again.");
      }
  }
  };
  const handleEdit = (id) => {
    navigate(`/bins/edit/${id}`);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-300 rounded-md"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Extract unique areas for filter dropdown
  const areas = [...new Set(bins.map((bin) => bin.location).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Bins List</h1>
          <Button onClick={() => navigate("/bins/add")}>Add New Bin</Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-md w-full sm:w-1/3"
          />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="p-2 border rounded-md w-full sm:w-1/3"
          >
            <option value="">All Locations</option>
            {areas.map((area) => (
              <option key={area} value={area} >
                {area}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-md w-full sm:w-1/3"
          >
            <option value="">All Fill Status</option>
            <option value="available">Empty/Available</option>
            <option value="half-filled">Half Filled</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Bin Grid */}
        {displayedBins.length === 0 ? (
          <p className="text-gray-500">
            No bins found. Adjust your search or add a new bin.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedBins.map((bin) => (
              <BinCard key={bin.id} bin={bin} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {/* See All Button */}
        {!showAll && displayedBins.length < filteredCount && (
          <div className="flex justify-center mt-6 rounded-md">
            <Button onClick={() => setShowAll(true)}>See All</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BinsPage;
