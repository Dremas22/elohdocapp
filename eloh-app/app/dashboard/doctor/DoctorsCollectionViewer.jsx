"use client";

import DoctorDashboardNavbar from "@/app/dashboard/doctor/doctorNav";
import SidebarMenu from "./doctorSidebar";
import DooctorEarnings from "./doctorEarnings";
import SearchBar from "@/components/doctors/SearchBar";
import { useState } from "react";
import FilteredPatientsTable from "./FilteredPatientsTable";
import ViewPatientsRecords from "@/components/doctors/viewPatientsRecords";

/**
 * DoctorsCollectionViewer
 * Displays the doctor's dashboard, including:
 * - Navbar
 * - Sidebar with action buttons
 * - Welcome message or verification status
 * - Conditional mobile/desktop layouts
 *
 * @param {Object} props
 * @param {Object} props.userDoc - The authenticated doctor's user document.
 * @param {Array} props.patients - (Optional) A list of assigned patients (currently unused).
 */
const DoctorsCollectionViewer = ({ userDoc, patients }) => {
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [openViewPatientRecords, setOpenViewPatientRecords] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredPatients([]);
      return;
    }

    const filtered = patients?.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(query) ||
        p.idNumber?.toLowerCase().includes(query)
    );

    setFilteredPatients(filtered);
  };
  // Handles a case where userDoc is missing
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

  // Destructuring  verification and practice number from user profile
  const { practiceNumber, isVerified } = userDoc;

  return (
    <div className="min-h-screen flex flex-col pt-20 relative overflow-hidden">
      {/* Top fixed navbar */}
      <DoctorDashboardNavbar />

      {/* Main layout section */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full bg-gray-950 flex-grow">
        {/* Desktop Navigation: displayed on the left side of the screen*/}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(100vh-5rem)]">
          <SidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDoc}
            setShowEarnings={setShowEarnings}
          />
        </aside>

        {/* Main content panel */}
        <main className="w-full lg:w-3/4 p-6 flex flex-col items-center justify-start text-center bg-transparent">
          {isVerified === true ? (
            <>
              {/* Welcome banner for verified doctors */}
              <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight mt-10 mb-10">
                Welcome to your virtual surgery.
              </h1>

              {showEarnings && <DooctorEarnings />}

              <SearchBar
                onSearch={handleSearch}
                query={query}
                setQuery={setQuery}
                debouncedQuery={debouncedQuery}
                setDebouncedQuery={setDebouncedQuery}
              />

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

              {openViewPatientRecords && (
                <ViewPatientsRecords
                  data={selectedPatient?.medicalHistory}
                  setOpenViewPatientRecords={setOpenViewPatientRecords}
                />
              )}

              {/* Mobile Navigation shown below welcome message on mobile */}
              <div className="block lg:hidden w-80 mt-25">
                <SidebarMenu
                  practiceNumber={practiceNumber}
                  isVerified={isVerified}
                  userDoc={userDoc}
                  compact
                />
              </div>
            </>
          ) : isVerified === false ? (
            // Message shown if account is still pending verification
            <div className="text-gray-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll be able to access
                sensitive patient information here.
              </p>
            </div>
          ) : (
            // Message shown if account was declined
            <div className="text-red-600">
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
