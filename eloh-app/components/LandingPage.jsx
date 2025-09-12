"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";
import Navbar from "./MainNavbar";
import AmbulanceButton from "./AmbulanceButton";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div>
        <Video />
        <ChooseDesignation />
        <div className="relative w-full bg-black ">
          <img
            src="/images/banner1a.png"
            alt="ElohDoc Banner"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
