"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/db/client";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";

import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NurseDashboardNavbar from "@/app/dashboard/nurse/nurseNav";
import NurseSidebarMenu from "./nurseSidebar";
import Link from "next/link";
import SearchBar from "@/components/doctors/SearchBar";
import { FiX } from "react-icons/fi";
import FilteredPatientsTable from "../doctor/FilteredPatientsTable";
import ViewPatientsRecords from "@/components/doctors/viewPatientsRecords";
import Earnings from "../doctor/doctorEarnings";
import { useUserStore } from "@/hooks/useUserStore";
import ElohDocChatApp from "@/components/chat-app/ElohDocChatApp";

const NurseCollectionViewer = () => {
  const [userDoc, setUserDoc] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [openViewPatientRecords, setOpenViewPatientRecords] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const patientRecordsRef = useRef(null);
  const { fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user?.uid;
      const nurseRef = doc(db, "nurses", userId);

      // Set up real-time listener on nurse document
      const unsubscribeDoc = onSnapshot(nurseRef, async (nurseSnap) => {
        if (nurseSnap.exists()) {
          const userDataRaw = nurseSnap.data();
          const userData = {
            ...userDataRaw,
            createdAt: convertTimestamp(userDataRaw.createdAt),
            updatedAt: convertTimestamp(userDataRaw.updatedAt),
          };
          setUserDoc(userData);
          fetchUserInfo(userData);
        }
      });

      // Fetch all patients once
      const fetchPatients = async () => {
        try {
          const patientsSnap = await getDocs(collection(db, "patients"));
          const patientsList = patientsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt),
            updatedAt: convertTimestamp(doc.data().updatedAt),
          }));
          setPatients(patientsList);
        } catch (err) {
          console.error("Error fetching patients:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPatients();

      return () => {
        unsubscribeDoc();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

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

  if (loading) {
    return (
      <>
        <NurseDashboardNavbar />
        <div className="flex items-center justify-center h-screen bg-gray-950 pt-16">
          <div className="text-center text-gray-600">Loading dashboard...</div>
        </div>
      </>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20">
        <NurseDashboardNavbarDashboardNavbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-blue-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
            <div className="flex justify-center mt-6">
              <Link href="/sign-in?role=nurse" passHref>
                <button
                  type="button"
                  className="bg-[#03045e] text-white py-3 px-6 text-xs md:text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center justify-center gap-1 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Go to Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { practiceNumber, isVerified } = userDoc;

  return (
    <div className="min-h-screen flex flex-col pt-12 relative overflow-hidden">
      <NurseDashboardNavbar />
      <div className="relative z-10 flex flex-col lg:flex-row w-full bg-gray-950 flex-grow">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(100vh-5rem)]">
          <NurseSidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDoc}
            setShowEarnings={setShowEarnings}
          />
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 p-6 md:pl-15 flex flex-col items-center justify-start text-center bg-transparent">
          {isVerified === true ? (
            <>
              <h1 className="bg-gradient-to-r from-teal-300 via-blue-400 to-purple-500 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight mt-10 mb-10">
                Welcome Nurse!
              </h1>

              {/* Earnings Modal */}
              {showEarnings && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-xl text-black p-8 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd]">
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

                    <Earnings role="nurse" data={userDoc} />
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
                  < FilteredPatientsTable
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
                  className="w-full pl-25 overflow-y-auto max-h-[calc(150vh-rem)] px-4 mt-6"
                >
                  <ViewPatientsRecords
                    data={selectedPatient?.medicalHistory}
                    setOpenViewPatientRecords={setOpenViewPatientRecords}
                    patientId={selectedPatient?.userId}
                  />
                </div>
              )}

              {/* Mobile Sidebar under main content */}
              <div className="block lg:hidden w-80 mt-10 ">
                <NurseSidebarMenu
                  practiceNumber={practiceNumber}
                  isVerified={isVerified}
                  userDoc={userDoc}
                  setShowEarnings={setShowEarnings}
                  compact
                />
              </div>

              {/* Chat App */}
              <div className="lg:w-[185vh] md:w-[90vh] w-[45vh] lg:ml-69 md:-ml-5 ml-0 h-auto flex flex-col pt-8 mb-9 flex-grow">
                <ElohDocChatApp />
              </div>

            </>
          ) : isVerified === false ? (
            <div className="text-gray-400 text-center">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once verified, you can access patient records and tools here.
              </p>
            </div>
          ) : (
            <div className="text-red-600 text-center">
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

export default NurseCollectionViewer;
