"use client";

import React from "react";

const Video = () => {
  return (
    <div className="relative w-full h-[90vh] bg-black overflow-hidden">
      <video
        className="w-full h-[110%] object-cover translate-y-[-5%]"
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
