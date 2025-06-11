"use client";

import React from "react";
import Navbar from "./navbar";
import ChooseDesignation from "./selection";
import Video from "./video";

const LandingPage = () => {
    return (
        <div>
            <Navbar />
            <Video />
            <ChooseDesignation />
        </div>
    )
}

export default LandingPage;