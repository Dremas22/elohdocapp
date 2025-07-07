"use client";

import PatientMeetingSetup from "@/components/patients/PatientMeetingSetup";
import PatientDashboardNavbar from "./patientNav";

const PatientDashboard = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <PatientDashboardNavbar />
      <div className="pt-20">
        <PatientMeetingSetup />
      </div>
    </div>
  );
};

export default PatientDashboard;
