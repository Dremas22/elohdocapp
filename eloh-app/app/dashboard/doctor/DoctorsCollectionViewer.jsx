"use client";

import { useState } from "react";
import DoctorDashboardNavbar from "./doctorNav";
import PatientDisplay from "@/components/patients/PatientDisplay";
import SidebarMenu from "./doctorSidebar";

const DoctorsCollectionViewer = ({ userDoc, patients }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <DoctorDashboardNavbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { practiceNumber, isVerified } = userDoc;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <DoctorDashboardNavbar />
      </div>

      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-1">
        {/* SidebarMenu here */}
        <SidebarMenu practiceNumber={practiceNumber} isVerified={isVerified} />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {isVerified === true ? (
            <div>
              <h1 className="text-xl font-semibold mb-4">Patient Info</h1>
              <PatientDisplay patients={patients} />
            </div>
          ) : isVerified === false ? (
            <div className="text-center mt-12 text-gray-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll be able to access
                sensitive patient information here.
              </p>
            </div>
          ) : (
            <div className="text-center mt-12 text-red-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Declined
              </h2>
              <p>
                We could not verify your account. Please ensure your practice
                number is registered or contact support for help.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorsCollectionViewer;
