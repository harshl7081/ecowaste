"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client-side
  if (typeof window === "undefined") return;
  
  // If not already fixed
  if (L.Icon.Default.imagePath !== "/") {
    L.Icon.Default.imagePath = "/";
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }
};

// Define props interface
interface MapComponentProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (latlng: { lat: number; lng: number }) => void;
}

export default function MapComponent({ position, onPositionChange }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Using useMemo to prevent re-creation on every render
  const defaultPosition = useMemo(() => ({ lat: 28.6139, lng: 77.2090 }), []); // New Delhi
  
  // Initialize the map on component mount
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;
    
    // Fix Leaflet icons
    fixLeafletIcons();
    
    // Create map instance
    const map = L.map(containerRef.current).setView(
      position || defaultPosition, 
      13
    );
    
    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    
    // Add click handler to map
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      onPositionChange(newPosition);
    });
    
    // Store map reference
    mapRef.current = map;
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultPosition, onPositionChange, position]);
  
  // Create or update marker when position changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (position) {
      // Update marker position or create new marker
      if (markerRef.current) {
        markerRef.current.setLatLng([position.lat, position.lng]);
      } else {
        // Create marker
        const marker = L.marker([position.lat, position.lng], {
          draggable: true,
        }).addTo(mapRef.current);
        
        // Add drag end handler
        marker.on("dragend", () => {
          const latLng = marker.getLatLng();
          onPositionChange({
            lat: latLng.lat,
            lng: latLng.lng,
          });
        });
        
        markerRef.current = marker;
      }
      
      // Center map on position
      mapRef.current.setView([position.lat, position.lng], mapRef.current.getZoom());
    }
  }, [position, onPositionChange]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: "100%", width: "100%" }}
      className="relative bg-gray-100 rounded-md"
    />
  );
} 