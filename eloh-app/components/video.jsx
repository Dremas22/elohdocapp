"use client";

import React from "react";
import Subscriptions from "./subscriptions/page";

/**
 * Video component for the landing page.
 * - Responsive full-width background video
 * - Contains the Subscriptions section directly below the video
 */
const Video = () => {
  return (
    <div className="relative w-full bg-white overflow-hidden">
      {/* 🎥 Video Background */}
      <div className="relative w-full overflow-hidden">
        <video
          className="w-full min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] lg:-mt-15 -mt-30.75 -mb-30 object-contain"
          src="/videos/elohdocvid2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* 💡 Subscriptions Section */}
      <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt- lg:mb-25 mb-35">
        <Subscriptions />
      </div>
    </div>
  );
};

export default Video;
