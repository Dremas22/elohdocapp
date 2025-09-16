"use client";

import { useState, useRef, useEffect } from "react";

import Link from "next/link";
import { db } from "@/db/client";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "@/hooks/useUserStore";
import { useChatStore } from "@/hooks/useChatStore";
import { FiX } from "react-icons/fi";
import DoctorDashboardNavbar from "@/app/dashboard/doctor/doctorNav";
import SidebarMenu from "./doctorSidebar";
import Earnings from "./doctorEarnings";
import SearchBar from "@/components/doctors/SearchBar";
import FilteredPatientsTable from "./FilteredPatientsTable";
import ViewPatientsRecords from "@/components/doctors/viewPatientsRecords";
import ElohDocChatApp from "@/components/chat-app/ElohDocChatApp";

/**
 * DoctorsCollectionViewer
 * Main component for displaying doctor dashboard including:
 * - Navbar
 * - Sidebar (desktop & mobile)
 * - Patient search & table
 * - Patient medical records viewer
 * - Chat app
 * - Earnings modal
 */

const DoctorsCollectionViewer = ({ userDoc, patients, userId }) => {
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [openViewPatientRecords, setOpenViewPatientRecords] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [userDocState, setUserDoc] = useState(userDoc || {});
  const [openChat, setOpenChat] = useState(false);

  const patientRecordsRef = useRef(null);
  const { fetchUserInfo } = useUserStore();
  const { unseenCount } = useChatStore();

  // Scroll to patient records when opened
  useEffect(() => {
    if (openViewPatientRecords && patientRecordsRef.current) {
      patientRecordsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openViewPatientRecords]);

  // Listen to real-time doctor document updates
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = onSnapshot(doc(db, "doctors", userId), (docSnap) => {
      if (docSnap.exists()) {
        const updatedData = docSnap.data();
        setUserDoc((prev) => ({ ...prev, ...updatedData }));
        fetchUserInfo(updatedData);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  // Handle patient search
  const handleSearch = (query) => {
    if (!query) {
      setFilteredPatients([]);
      return;
    }
    const filtered = patients?.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        p.idNumber?.toLowerCase().includes(query.toLowerCase()) ||
        p.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  // If no doctor data
  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center text-blue-600">
          <p className="text-lg font-medium">No user data found.</p>
          <p className="text-sm mt-1">Please make sure your account is registered correctly.</p>
          <Link href="/sign-in?role=doctor" passHref>
            <button className="mt-6 bg-[#03045e] text-white py-3 px-6 text-sm font-semibold rounded-xl shadow-md hover:bg-[#023e8a] transition-all">
              Go to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { isVerified, practiceNumber } = userDocState;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative overflow-hidden">
      {/* Navbar */}
      <DoctorDashboardNavbar />

      <div className="relative z-10 flex flex-col lg:flex-row flex-grow min-h-0 mt-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-0">
          <SidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDocState}
          />
        </aside>

        {/* Mobile Sidebar */}
        <div className="block lg:hidden w-full max-w-xs pl-7 mt-10">
          <SidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDocState}
            compact
          />
        </div>

        {/* Main Content */}
        <main className="w-full flex flex-col flex-grow overflow-hidden px-4 sm:px-6 lg:px-8">
          {isVerified === true ? (
            <>
              {/* Sticky Banner */}
              <div className="sticky top-0 mt-15 z-20 bg-gray-950 w-full py-6 shadow-md">
                <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight text-center">
                  Welcome to your virtual surgery.
                </h1>
              </div>

              {/* Earnings Modal */}
              {showEarnings && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-xl text-black p-6 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd]">
                    <button
                      onClick={() => setShowEarnings(false)}
                      className="absolute top-3 right-4 text-gray-600 hover:text-red-600 text-xl cursor-pointer"
                    >
                      <FiX />
                    </button>
                    <h2 className="text-2xl font-bold mb-5 text-[#0d6efd] text-center">Earnings</h2>
                    <Earnings role="doctor" data={userDocState} />
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="mt-6 w-full max-w-5xl mx-auto">
                <SearchBar
                  onSearch={handleSearch}
                  query={query}
                  setQuery={setQuery}
                  debouncedQuery={debouncedQuery}
                  setDebouncedQuery={setDebouncedQuery}
                />
              </div>

              {/* Search Results Table */}
              {debouncedQuery && (
                filteredPatients.length > 0 ? (
                  <FilteredPatientsTable
                    patients={filteredPatients}
                    setOpenViewPatientRecords={setOpenViewPatientRecords}
                    setSelectedPatient={setSelectedPatient}
                  />
                ) : (
                  <p className="text-gray-400 mt-4 text-center">No patients found for "{query}".</p>
                )
              )}

              {/* Medical Records Viewer */}
              {openViewPatientRecords && (
                <div ref={patientRecordsRef} className="w-full overflow-y-auto mt-8">
                  <ViewPatientsRecords
                    data={selectedPatient?.medicalHistory}
                    setOpenViewPatientRecords={setOpenViewPatientRecords}
                    patientId={selectedPatient?.userId}
                  />
                </div>
              )}

              {/* Chat App */}
              <div className="lg:w-[185vh] md:w-[90vh] w-[44vh] lg:ml-10 md:-ml-5 -ml-3 h-auto flex flex-col pt-8 mb-25 flex-grow">
                <ElohDocChatApp />
              </div>
            </>
          ) : isVerified === false ? (
            <div className="text-gray-600 mt-10 text-center">
              <h2 className="text-lg font-semibold mb-2">Verification Pending</h2>
              <p>Once your account is verified, you'll access patient information here.</p>
            </div>
          ) : (
            <div className="text-red-600 mt-10 text-center">
              <h2 className="text-lg font-semibold mb-2">Verification Declined</h2>
              <p>We could not verify your account. Please contact support for help.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorsCollectionViewer;
