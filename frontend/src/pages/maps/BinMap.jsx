import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllBins } from "../../api/bins.js";
import { Loader2, AlertCircle, MapPin, User, Gauge, ExternalLink, Navigation } from "lucide-react";

// Custom TRASH BIN marker icons for different statuses
const createBinMarkerIcon = (fillColor, strokeColor = "#ffffff") => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
      <!-- Shadow -->
      <ellipse cx="20" cy="46" rx="10" ry="2" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Bin Body -->
      <path d="M8 16 L10 42 C10 44 12 46 14 46 L26 46 C28 46 30 44 30 42 L32 16 Z" 
            fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      
      <!-- Bin Lid -->
      <rect x="6" y="12" width="28" height="5" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      
      <!-- Lid Handle -->
      <rect x="16" y="8" width="8" height="5" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      
      <!-- Bin Lines (details) -->
      <line x1="14" y1="20" x2="14" y2="40" stroke="${strokeColor}" stroke-width="1.5" opacity="0.7"/>
      <line x1="20" y1="20" x2="20" y2="40" stroke="${strokeColor}" stroke-width="1.5" opacity="0.7"/>
      <line x1="26" y1="20" x2="26" y2="40" stroke="${strokeColor}" stroke-width="1.5" opacity="0.7"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: "custom-bin-marker",
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

// Marker icons - Trash bin style
const greenBinIcon = createBinMarkerIcon("#22c55e");    // Available - Green
const yellowBinIcon = createBinMarkerIcon("#f59e0b");   // Half Full - Yellow/Amber
const redBinIcon = createBinMarkerIcon("#ef4444");      // Almost Full - Red
const grayBinIcon = createBinMarkerIcon("#6b7280");     // Maintenance - Gray

// Component to fit map bounds to all markers
const FitBounds = ({ bins }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bins.length > 0) {
      const bounds = L.latLngBounds(
        bins.map((bin) => [parseFloat(bin.latitude), parseFloat(bin.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bins, map]);
  
  return null;
};

const BinMap = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBin, setSelectedBin] = useState(null);

  // Default center (Khulna, Bangladesh)
  const defaultCenter = [22.89792, 89.5021];

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await getAllBins();
        setBins(res.data);
      } catch (err) {
        console.error("Failed to fetch bins:", err);
        setError("Failed to load bins data");
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
  }, []);

  // Get marker icon based on status and fill level
  const getMarkerIcon = (bin) => {
    if (bin.status === "maintenance") return grayBinIcon;
    const fillRatio = (bin.current_level || 0) / (bin.capacity || 100);
    if (fillRatio >= 0.8) return redBinIcon;
    if (fillRatio >= 0.5) return yellowBinIcon;
    return greenBinIcon;
  };

  // Get status label
  const getStatusLabel = (bin) => {
    if (bin.status === "maintenance") return { text: "Maintenance", color: "bg-gray-500", textColor: "text-gray-600" };
    const fillRatio = (bin.current_level || 0) / (bin.capacity || 100);
    if (fillRatio >= 0.8) return { text: "Almost Full", color: "bg-red-500", textColor: "text-red-600" };
    if (fillRatio >= 0.5) return { text: "Half Full", color: "bg-amber-500", textColor: "text-amber-600" };
    return { text: "Available", color: "bg-emerald-500", textColor: "text-emerald-600" };
  };

  // Get color class
  const getColorClass = (bin) => {
    if (bin.status === "maintenance") return "bg-gray-500";
    const fillRatio = (bin.current_level || 0) / (bin.capacity || 100);
    if (fillRatio >= 0.8) return "bg-red-500";
    if (fillRatio >= 0.5) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Filter bins with valid coordinates
  const validBins = bins.filter(
    (bin) =>
      bin.latitude != null &&
      bin.longitude != null &&
      !isNaN(parseFloat(bin.latitude)) &&
      !isNaN(parseFloat(bin.longitude))
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading bins...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-xl">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Failed to load bins</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // No bins state
  if (validBins.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No bins with valid locations</p>
          <p className="text-gray-400 text-sm mt-1">
            Add bins with latitude and longitude to see them on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Map Section */}
      <div className="xl:col-span-3">
        <div className="h-[550px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds bins={validBins} />
            
            {validBins.map((bin) => (
              <Marker
                key={bin.id}
                position={[parseFloat(bin.latitude), parseFloat(bin.longitude)]}
                icon={getMarkerIcon(bin)}
                eventHandlers={{
                  click: () => setSelectedBin(bin),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{bin.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">📍 {bin.location || "No location"}</p>
                      <p className="text-gray-600">
                        📊 {bin.current_level || 0} / {bin.capacity} L
                      </p>
                      <p className={`font-medium ${getStatusLabel(bin).textColor}`}>
                        Status: {getStatusLabel(bin).text}
                      </p>
                      {bin.driver_name && (
                        <p className="text-gray-600">👤 {bin.driver_name}</p>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${bin.latitude},${bin.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      <Navigation size={14} /> Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Sidebar - Bin Details or List */}
      <div className="xl:col-span-1">
        {selectedBin ? (
          /* Selected Bin Details */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={`p-4 ${getColorClass(selectedBin)} text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{selectedBin.name}</h3>
                <button
                  onClick={() => setSelectedBin(null)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm opacity-90">{getStatusLabel(selectedBin).text}</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm">{selectedBin.location || "No location"}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Gauge className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm">
                  {selectedBin.current_level || 0} / {selectedBin.capacity} L
                </span>
              </div>

              {selectedBin.driver_name && (
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm">{selectedBin.driver_name}</span>
                </div>
              )}

              {/* Fill Level Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Fill Level</span>
                  <span>
                    {Math.round(
                      ((selectedBin.current_level || 0) / (selectedBin.capacity || 100)) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClass(selectedBin)}`}
                    style={{
                      width: `${Math.min(
                        ((selectedBin.current_level || 0) / (selectedBin.capacity || 100)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                <p className="text-sm font-mono text-gray-700">
                  {selectedBin.latitude}, {selectedBin.longitude}
                </p>
              </div>

              {/* Directions Button */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBin.latitude},${selectedBin.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium"
              >
                <ExternalLink size={18} />
                Get Directions
              </a>
            </div>
          </div>
        ) : (
          /* Bins List */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">All Bins ({validBins.length})</h3>
              <p className="text-xs text-gray-500 mt-1">Click a marker or bin to view details</p>
            </div>
            <div className="max-h-[460px] overflow-y-auto">
              {validBins.map((bin) => (
                <div
                  key={bin.id}
                  onClick={() => setSelectedBin(bin)}
                  className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(bin)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{bin.name}</p>
                      <p className="text-xs text-gray-500 truncate">{bin.location || "No location"}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getColorClass(bin)}`}>
                      {Math.round(((bin.current_level || 0) / (bin.capacity || 100)) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinMap;