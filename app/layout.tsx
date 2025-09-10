import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';

const primaryFont = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Community Health Monitoring System",
  description: "AI-powered health monitoring and early warning system for Indian communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body className="bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
