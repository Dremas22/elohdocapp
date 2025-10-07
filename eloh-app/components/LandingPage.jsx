"use client";

import React from "react";
import ChooseDesignation from "../components/selection";
import Video from "../components/video";
import Navbar from "./MainNavbar";
import PayToDoctor from "@/components/patients/payments/payToDoctor";
import PayToNurse from "@/components/patients/payments/payToNurse";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div>
        <Video />

        {/* Payment Options Section */}
        <section className="py-20 bg-[#f8faff] px-6 md:px-12 mb-10 ">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#03045e] mb-6">
              Consultation Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Explore our affordable teleconsultation options below. Whether you prefer to
              speak with a doctor or a nurse, ElohDoc offers flexible packages to meet your
              healthcare needs.
            </p>

            {/* Doctor Packages */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Doctor Consultation Packages
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                <PayToDoctor displayOnly />
              </div>
            </div>

            {/* Nurse Packages */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Nurse Consultation Packages
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                <PayToNurse displayOnly />
              </div>
            </div>
          </div>
        </section>

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
