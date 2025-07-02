"use client";

import React from "react";

const Video = () => {
  return (
    // Used 'h-[65vh]' to set the height of the video to 65% for partial screen video
    <div className="relative w-full h-[65vh]">

      <video
        // 'absolute top-0 left-0' positions the video at the top-left corner
        // 'object-cover' scales and crops the video to fill the space without distortion
        className="absolute top-0 left-0 w-full h-full object-cover"

        // Video source and playback settings
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
