"use client";

import Loading from "@/components/Loading";
import DriverMap from "@/components/maps/DriverMap";
import Script from "next/script";
import { useState } from "react";

const DriversDashboard = () => {
  const [mapsReady, setMapsReady] = useState(false);

  return (
    <div className="flex items-center justify-center w-full h-screen text-black">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          setMapsReady(true);
        }}
        onError={() => console.error("❌ Google Maps script failed to load")}
      />

      {/* Only render DriverMap when Google Maps is ready */}
      {mapsReady ? <DriverMap /> : <Loading message="Loading Map..." />}
    </div>
  );
};

export default DriversDashboard;
