"use client";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Runner } from "@/data/mocks";
import Link from "next/link";

// Custom Icon Function for Runners
const createRunnerIcon = (url: string) => {
  return L.divIcon({
    className: "custom-runner-marker",
    html: `
      <div class="relative w-12 h-12 group">
        <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div class="absolute inset-0 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white transition-transform transform hover:scale-110">
          <img src="${url}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

// User Location Icon (Pulse Effect)
const userIcon = L.divIcon({
  className: "user-marker",
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
      <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10],
});

interface MapProps {
  runners: Runner[];
}

export default function Map({ runners }: MapProps) {
  // Center map on Lagos, Nigeria
  const defaultCenter: [number, number] = [6.5244, 3.3792];
  
  return (
    <div className="h-full w-full rounded-xl overflow-hidden z-0 relative bg-gray-100">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false}
      >
        {/* CartoDB Voyager Tile Layer (Cleaner, Modern Look) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Custom Zoom Control */}
        <ZoomControl position="bottomright" />

        {/* User Location Marker */}
        <Marker position={defaultCenter} icon={userIcon}>
             <Popup className="custom-popup rounded-lg border-0 shadow-xl">
                <div className="text-center px-2 py-1">
                   <p className="font-bold text-sm text-gray-800">You are here</p>
                </div>
             </Popup>
        </Marker>

        {/* Runner Markers */}
        {runners.map((runner) => (
          <Marker 
            key={runner.id} 
            position={runner.coordinates} 
            icon={createRunnerIcon(runner.photo)}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="flex flex-col gap-3 min-w-[220px] p-0 font-sans">
                {/* Header with Photo & Name */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <img src={runner.photo} alt={runner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base">{runner.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className={`w-2 h-2 rounded-full ${runner.availability === "Available" ? "bg-green-500" : "bg-red-500"}`}></span>
                           <span className="text-xs text-gray-500 font-medium">{runner.availability}</span>
                        </div>
                    </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                   <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{runner.rating}</span>
                      <span className="text-gray-400">({runner.reviewsCount})</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <span className="text-blue-500">📍</span>
                      <span className="font-medium">{runner.distance}</span>
                   </div>
                </div>

                {/* Action Button */}
                <Link 
                   href={`/runner/${runner.id}`} 
                   className="flex items-center justify-center w-full bg-black text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-all active:scale-95"
                >
                    View Profile
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}