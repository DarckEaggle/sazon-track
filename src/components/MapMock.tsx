"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet map to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export function MapMock() {
  const [mounted, setMounted] = useState(false);
  const position: [number, number] = [-12.0464, -77.0428]; // Lima, Peru

  useEffect(() => {
    setMounted(true);
    
    // Fix Leaflet icon issue in Next.js
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!mounted) {
    return (
      <div className="glass-panel h-64 rounded-2xl animate-pulse flex items-center justify-center">
        <p className="text-foreground/50">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-2 rounded-2xl overflow-hidden mt-6">
      <div className="h-64 w-full rounded-xl overflow-hidden relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <b>Sazón Criolla</b> <br /> Restaurante
            </Popup>
          </Marker>
          <Marker position={[-12.05, -77.05]}>
            <Popup>Repartidor en camino</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
