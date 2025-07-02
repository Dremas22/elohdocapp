"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";

const LandingPage = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Video />
      <ChooseDesignation />
    </div>
  );
};

export default LandingPage;
