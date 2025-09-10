"use client";

import { useEffect, useRef, useState } from "react";

type HeatmapPoint = {
  lat: number;
  lng: number;
  intensity: number;
  location: string;
};

const diseaseOptions = ["waterborne", "malaria", "dengue", "cholera"];

function randomPoints(center: { lat: number; lng: number }, count: number) {
  const points: HeatmapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const lat = center.lat + (Math.random() - 0.5) * 0.5;
    const lng = center.lng + (Math.random() - 0.5) * 0.5;
    const intensity = Math.random() * 0.6 + 0.4;
    points.push({ lat, lng, intensity, location: "NE India" });
  }
  return points;
}

const mockHeatmapData: Record<string, HeatmapPoint[]> = {
  waterborne: [
    ...randomPoints({ lat: 26.1445, lng: 91.7362 }, 10),
    ...randomPoints({ lat: 25.4670, lng: 91.3662 }, 8),
    ...randomPoints({ lat: 24.8170, lng: 93.9368 }, 6),
    ...randomPoints({ lat: 23.8315, lng: 92.9376 }, 5),
  ],
  malaria: [
    ...randomPoints({ lat: 26.1445, lng: 91.7362 }, 12),
    ...randomPoints({ lat: 25.4670, lng: 91.3662 }, 9),
    ...randomPoints({ lat: 24.8170, lng: 93.9368 }, 7),
    ...randomPoints({ lat: 23.8315, lng: 92.9376 }, 6),
  ],
  dengue: [
    ...randomPoints({ lat: 26.1445, lng: 91.7362 }, 8),
    ...randomPoints({ lat: 25.4670, lng: 91.3662 }, 7),
    ...randomPoints({ lat: 24.8170, lng: 93.9368 }, 5),
    ...randomPoints({ lat: 23.8315, lng: 92.9376 }, 4),
  ],
  cholera: [
    ...randomPoints({ lat: 26.1445, lng: 91.7362 }, 6),
    ...randomPoints({ lat: 25.4670, lng: 91.3662 }, 5),
    ...randomPoints({ lat: 24.8170, lng: 93.9368 }, 4),
    ...randomPoints({ lat: 23.8315, lng: 92.9376 }, 3),
  ],
};

const gradientMap: Record<string, any> = {
  waterborne: { 0.1: "green", 0.5: "yellow", 1.0: "red" },
  malaria: { 0.1: "blue", 0.5: "purple", 1.0: "darkred" },
  dengue: { 0.1: "#00ffff", 0.5: "#ff8000", 1.0: "#ff0000" },
  cholera: { 0.1: "#c0ffc0", 0.5: "#ffb3b3", 1.0: "#990000" },
};

export default function PointDensityMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);

  const [disease, setDisease] = useState<string>(diseaseOptions[0]);
  const [loading, setLoading] = useState<boolean>(true);

  const renderHeatmap = async () => {
    if (!mapInstanceRef.current) return;

    const points = mockHeatmapData[disease] || [];
    const L = (await import("leaflet")).default;
    await import("leaflet.heat");

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
    }

    heatLayerRef.current = (L as any).heatLayer(
      points.map((p) => [p.lat, p.lng, p.intensity]),
      { radius: 25, blur: 15, maxZoom: 10, gradient: gradientMap[disease] }
    ).addTo(mapInstanceRef.current);

    setLoading(false);
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // If map already exists, just render heatmap and return
      if (mapInstanceRef.current) {
        renderHeatmap();
        return;
      }

      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current, {
        center: [25.6, 92.0],
        zoom: 6,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      renderHeatmap();
    };

    const waitForHeight = () => {
      if (mapRef.current && mapRef.current.clientHeight > 0) initMap();
      else requestAnimationFrame(waitForHeight);
    };
    waitForHeight();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setLoading(true);
      renderHeatmap();
    }
  }, [disease]);

  return (
    <div className="w-full">
      <div className="mb-2 flex space-x-2">
        {diseaseOptions.map((d) => (
          <button
            key={d}
            className={`px-3 py-1 rounded ${
              disease === d ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setDisease(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div ref={mapRef} className="w-full h-[500px] rounded-xl border" />
      {loading && <p className="text-gray-500 mt-2">Loading heatmap...</p>}
    </div>
  );
}
