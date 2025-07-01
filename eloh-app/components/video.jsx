"use client";

import React from "react";

const Video = () => {
  return (
    <video
      className="absolute top-0 left-0 w-full h-full object-cover"
      src="/videos/elohdocvid.mp4"
      autoPlay
      loop
      muted
      playsInline
    />
  );
};

export default Video;
