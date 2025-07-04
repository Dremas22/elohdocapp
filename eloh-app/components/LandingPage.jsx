"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";
import Navbar from "./navbar";

const LandingPage = () => {
  return (
    <div
      className="flex flex-col min-h-screen relative">
      <Navbar />
      <Video />
      <ChooseDesignation />
    </div>
  );
};

export default LandingPage;
