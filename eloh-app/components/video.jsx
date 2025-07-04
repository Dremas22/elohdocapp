"use client";

import React from "react";

const Video = () => {
  return (
    // Responsive height using Tailwind breakpoints
    <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[63vh]">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
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
