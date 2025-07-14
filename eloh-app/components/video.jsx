"use client";

import React from "react";

/**
 * Video component for the landing page.
 * - Displays a responsive video background.
 * - Adjusts height and vertical positioning based on screen size.
 * - Keeps the layout responsive without affecting desktop design.
 */

const Video = () => {
  return (
    // Outer container for video — controls size and layout
    <div
      className="relative w-full bg-black overflow-hidden
                 h-[60vh] xs:h-[65vh] sm:h-[70vh] md:h-[90vh]"
    >
      <video
        // Full width and responsive height based on screen size
        className="w-full 
                   h-[50%] xs:h-[100%] sm:h-[112%]
                   object-cover
                   translate-y-[-8%] xs:translate-y-[-8%] sm:translate-y-[-5%]"
        src="/videos/elohdocvid.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default Video;
