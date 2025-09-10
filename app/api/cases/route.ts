import { NextResponse } from "next/server";

// Mock NE India case points
const NE_POINTS = [
  { lat: 26.1445, lng: 91.7362, weight: 0.8 }, // Guwahati, Assam
  { lat: 24.3963, lng: 93.7800, weight: 0.6 }, // Imphal, Manipur
  { lat: 25.4672, lng: 91.3662, weight: 0.5 }, // Shillong, Meghalaya
  { lat: 23.8396, lng: 92.7311, weight: 0.7 }, // Aizawl, Mizoram
  { lat: 26.1556, lng: 94.5624, weight: 0.4 }, // Kohima, Nagaland
  { lat: 27.3389, lng: 88.6168, weight: 0.3 }, // Gangtok, Sikkim
  { lat: 23.9408, lng: 91.9882, weight: 0.6 }, // Agartala, Tripura
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "ne";

  const points = region === "ne" ? NE_POINTS : [];
  const total = points.length;
  const lastUpdated = new Date().toISOString();

  return NextResponse.json({ points, total, lastUpdated }, { status: 200 });
}
