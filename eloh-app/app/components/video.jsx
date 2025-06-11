"use client";

import React from "react";

export default function Video() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex w-full">
        <video
          className="w-full h-auto object-cover"
          src="/videos/elohdocvid.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  );
}
