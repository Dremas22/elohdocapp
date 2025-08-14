"use client";

import DriverMap from "@/components/maps/DriverMap";
import Script from "next/script";

const DriversDashboard = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen text-black">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive" // or "afterInteractive"
        onError={() => console.error("Google Maps script failed to load")}
      />
      <DriverMap />
    </div>
  );
};

export default DriversDashboard;
