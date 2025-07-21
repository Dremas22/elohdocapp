"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";
import Navbar from "./maiNavbar";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div>
        <Video />
        <ChooseDesignation />
      </div>
    </div>
  );
};

export default LandingPage;
