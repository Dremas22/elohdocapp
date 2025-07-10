"use client";

import DoctorDashboardNavbar from "@/app/dashboard/doctor/doctorNav";
import SidebarMenu from "./doctorSidebar";

const DoctorsCollectionViewer = ({ userDoc, patients }) => {
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
    <div className="min-h-screen flex flex-col pt-20 relative overflow-hidden">
      {/* Top Navbar */}
      <DoctorDashboardNavbar />

      {/* Animated glowing blobs */}
      <div className="absolute w-80 h-80 bg-blue-200 rounded-full blur-[100px] top-10 left-10 opacity-30 animate-pulse z-0" />
      <div className="absolute w-[420px] h-[420px] bg-blue-400 rounded-full blur-[140px] bottom-20 right-10 opacity-20 animate-pulse z-0" />
      <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-[120px] top-1/2 left-[10%] opacity-20 animate-pulse z-0" />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 relative z-10">
        <SidebarMenu
          practiceNumber={practiceNumber}
          isVerified={isVerified}
          userDoc={userDoc}
        />

        <main className="flex-1 p-6 bg-transparent flex items-center justify-center">
          {isVerified === true ? (
            <h1 className="text-center bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold text-5xl md:text-6xl leading-tight">
              Welcome to your virtual consultation
            </h1>
          ) : isVerified === false ? (
            <div className="text-center text-gray-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll be able to access
                sensitive patient information here.
              </p>
            </div>
          ) : (
            <div className="text-center text-red-600">
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
