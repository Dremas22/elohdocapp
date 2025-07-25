"use client";

import DoctorDashboardNavbar from "@/app/dashboard/doctor/doctorNav";
import SidebarMenu from "./doctorSidebar";
import DoctorEarnings from "./doctorEarnings";
import SearchBar from "@/components/doctors/SearchBar";
import { useState, useRef, useEffect } from "react";
import FilteredPatientsTable from "./FilteredPatientsTable";
import ViewPatientsRecords from "@/components/doctors/viewPatientsRecords";
import { FiX } from "react-icons/fi";
import Link from "next/link";

const DoctorsCollectionViewer = ({ userDoc, patients }) => {
  // State to manage search/filter and modals
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [openViewPatientRecords, setOpenViewPatientRecords] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Ref for scrolling to patient record viewer
  const patientRecordsRef = useRef(null);

  // Scroll into view when record viewer opens
  useEffect(() => {
    if (openViewPatientRecords && patientRecordsRef.current) {
      patientRecordsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openViewPatientRecords]);

  // Handle patient search by name or ID
  const handleSearch = (query) => {
    if (!query) {
      setFilteredPatients([]);
      return;
    }

    const filtered = patients?.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        p.idNumber?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredPatients(filtered);
  };

  // Show fallback if user document is missing
  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Navbar fallback (could be updated to a generic navbar) */}
        <PatientDashboardNavbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
            <Link href="/sign-in?role=doctor">
              <span className="inline-block mt-4 text-blue-600 hover:underline">
                Go to Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { practiceNumber, isVerified } = userDoc;

  return (
    <div className="min-h-screen flex flex-col pt-18 relative overflow-hidden">
      {/* Top Navigation Bar */}
      <DoctorDashboardNavbar />

      {/* Main layout container: Sidebar + Content */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full bg-gray-950 flex-grow">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(100vh-5rem)]">
          <SidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDoc}
            setShowEarnings={setShowEarnings}
          />
        </aside>

        {/* Main Content Area */}
        <main className="w-full lg:w-3/4 flex flex-col items-center text-center bg-transparent overflow-y-auto">
          {isVerified === true ? (
            <>
              {/* Sticky Welcome Banner */}
              <div className="sticky top-0 z-20 bg-gray-950 w-full py-6 shadow-md">
                <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight">
                  Welcome to your virtual surgery.
                </h1>
              </div>

              {/* Earnings Modal */}
              {showEarnings && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-xl text-black p-6 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd]">
                    {/* Close button */}
                    <button
                      onClick={() => setShowEarnings(false)}
                      className="absolute top-3 right-4 text-gray-600 hover:text-red-600 text-xl"
                      aria-label="Close Earnings Modal"
                    >
                      <FiX />
                    </button>

                    <h2 className="text-2xl font-bold mb-5 text-[#0d6efd] text-center">
                      Earnings
                    </h2>

                    <DoctorEarnings />
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="mt-8 w-full max-w-3xl px-4">
                <SearchBar
                  onSearch={handleSearch}
                  query={query}
                  setQuery={setQuery}
                  debouncedQuery={debouncedQuery}
                  setDebouncedQuery={setDebouncedQuery}
                />
              </div>

              {/* Search Results Table */}
              {debouncedQuery ? (
                filteredPatients.length > 0 ? (
                  <FilteredPatientsTable
                    patients={filteredPatients}
                    setOpenViewPatientRecords={setOpenViewPatientRecords}
                    setSelectedPatient={setSelectedPatient}
                  />
                ) : (
                  <p className="text-gray-400 mt-4">
                    No patients found for "{query}".
                  </p>
                )
              ) : null}

              {/* Medical Records Viewer */}
              {openViewPatientRecords && (
                <div
                  ref={patientRecordsRef}
                  className="w-full overflow-y-auto max-h-[calc(100vh-5rem)] px-4 mt-6"
                >
                  <ViewPatientsRecords
                    data={selectedPatient?.medicalHistory}
                    setOpenViewPatientRecords={setOpenViewPatientRecords}
                  />
                </div>
              )}

              {/* Mobile Sidebar */}
              <div className="block lg:hidden w-80 mt-10">
                <SidebarMenu
                  practiceNumber={practiceNumber}
                  isVerified={isVerified}
                  userDoc={userDoc}
                  setShowEarnings={setShowEarnings}
                  compact
                />
              </div>
            </>
          ) : isVerified === false ? (
            // If account is pending verification
            <div className="text-gray-600 mt-10">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll access patient information here.
              </p>
            </div>
          ) : (
            // If account is rejected
            <div className="text-red-600 mt-10">
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
