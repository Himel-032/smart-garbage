import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBins } from "../../api/bins.js";
import BinCard from "../../components/bins/BinCard.jsx";
import Button from "../../components/bins/Button.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";


const BinsPage = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBins = async () => {
    try {
      setLoading(true);
      const res = await getAllBins();
      setBins(res.data);
    } catch (err) {
      console.error("Error fetching bins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-300 rounded-md"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bins List</h1>
          <Button>Add New Bin</Button>
        </div>

        {bins.length === 0 ? (
          <p className="text-gray-500">No bins found. Add a new bin to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bins.map((bin) => (
              <BinCard key={bin.id} bin={bin} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BinsPage;