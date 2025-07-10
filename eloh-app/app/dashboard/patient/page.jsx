"use client";

import PatientMeetingSetup from "@/components/patients/PatientMeetingSetup";
import PatientDashboardNavbar from "@/app/dashboard/patient/patientNav";
import { useState } from "react";
import Chat from "@/components/Chat";

const PatientDashboard = () => {
  const [showChat, setShowChat] = useState(true);
  return (
    <div className="bg-gray-950 text-white min-h-screen relative">
      <PatientDashboardNavbar />
      <div className="pt-20">
        <PatientMeetingSetup />
      </div>

      {/* Chat overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto p-4">
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
