"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";

const LandingPage = () => {
  return (
    <div
      // Flex container arranged vertically
      // Ensures content takes up at least the full height of the viewport
      // 'relative' allows the absolutely positioned video to be placed relative to this container
      className="flex flex-col min-h-screen relative"
    >
      <Video />
      <ChooseDesignation />
    </div>
  );
};

export default LandingPage;
