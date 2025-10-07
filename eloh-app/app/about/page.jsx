"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/MainNavbar";
import PayToDoctor from "@/components/patients/payments/payToDoctor";
import PayToNurse from "@/components/patients/payments/payToNurse";

const About = () => {
  return (
    <main className="w-full bg-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* About Section */}
      <section className="py-20 px-6 pt-10 md:px-0 md:w-[75%] mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
          About Us
        </h2>

        <div className="mt-12 flex flex-col gap-16">
          {/* 1st item */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-1/2 h-[250px]">
              <Image
                src="/images/1.jpeg"
                alt="Accessible Healthcare"
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold text-gray-800">
                Accessible, Affordable, & Equitable Healthcare
              </h3>
              <p className="mt-2 text-gray-600">
                ElohDoc is South Africa's premier provider of telemedicine and telehealth
                services. We connect individuals with HPCSA-registered doctors, ensuring
                quality medical care regardless of location or socioeconomic status. Through
                technology and a supportive approach, we empower people to take control of
                their health, fostering healthier communities and a better quality of life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Options Section */}
      <section className="py-20 bg-[#f8faff] px-6 md:px-12">
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
    </main>
  );
};

export default About;
