"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";
import Navbar from "./MainNavbar";
import Subscriptions from "./subscriptions/page";


const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div>
        <Video />
        <div className="mb-25">
          <Subscriptions />
        </div>

        <ChooseDesignation />
        <div className="relative -mt-5 w-full bg-black ">
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
