"use client";

import { useEffect, useRef, useState } from "react";
import Chat from "@/components/Chat";
import PatientMeetingSetup from "@/components/patients/PatientMeetingSetup";
import PatientDashboardNavbar from "@/app/dashboard/patient/patientNav";
import PatientSidebarMenu from "./patientSidebar";
import useCurrentUser from "@/hooks/useCurrentUser";
import SaveStripePayment from "@/components/SaveStripePayment";
import { db } from "@/db/client";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import Link from "next/link";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import { MdInfo } from "react-icons/md";
import { useUserStore } from "@/hooks/useUserStore";

const MainPatientDashboard = () => {
  const { currentUser, loading } = useCurrentUser();
  const [userDoc, setUserDoc] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [mode, setMode] = useState("general-notes");
  const { fetchUserInfo } = useUserStore();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!loading && currentUser?.uid) {
      const userRef = doc(db, "patients", currentUser.uid);

      const unsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) return;

          const userData = snapshot.data();
          const type = userData.consultationType;
          const consultations = userData.consultations || {};

          const hasConsultations =
            type === "doctor"
              ? (consultations.doctor || 0) >= 1
              : type === "nurse"
              ? (consultations.nurse || 0) >= 1
              : (consultations.doctor || 0) >= 1 ||
                (consultations.nurse || 0) >= 1;

          if (hasConsultations && type !== "none") {
            setShowChat(false);
            if (!toastShown.current) {
              toast.info(
                <div className="flex items-start gap-3 w-full max-w-[90vw] lg:max-w-[70vw]">
                  <div className="text-sm leading-relaxed text-blue-900">
                    You already have consultations available. Redirecting...
                  </div>
                </div>,
                {
                  position: "top-center",
                  icon: <MdInfo className="text-blue-600 mt-1" size={24} />,
                  autoClose: 6000,
                  hideProgressBar: false,
                  theme: "light",
                }
              );
              toastShown.current = true;
            }
          } else {
            setShowChat(true);
            console.log("No consultations available");
          }
        },
        (error) => {
          console.error("Real-time consultations error:", error);
        }
      );
      return () => unsubscribe(); // Clean up listener
    }
  }, [currentUser?.uid, loading]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setUserLoading(true);
    const userRef = doc(db, "patients", currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setUserDoc(null);
        } else {
          const data = snapshot.data();

          const noteTypes = ["sickNotes", "prescriptions", "generalNotes"];
          if (data?.medicalHistory) {
            noteTypes.forEach((type) => {
              if (Array.isArray(data?.medicalHistory[type])) {
                data?.medicalHistory[type].sort((a, b) => {
                  const aDate = convertTimestamp(a.createdAt);
                  const bDate = convertTimestamp(b.createdAt);
                  return new Date(bDate) - new Date(aDate); // descending
                });
              }
            });
          }

          setUserDoc({ id: snapshot.id, ...data });
          fetchUserInfo({ id: snapshot.id, ...data });
        }

        setUserLoading(false);
      },
      (error) => {
        console.error("Error with userDoc real-time listener:", error);
        setUserLoading(false);
      }
    );

    return () => unsubscribe(); // Clean up the listener
  }, [currentUser?.uid]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#90e0ef] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20">
        <PatientDashboardNavbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-blue-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
            <div className="flex justify-center mt-6">
              <Link href="/sign-in?role=patient" passHref>
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

  return (
    <div className="lg:min-h-screen flex flex-col pt-18 relative bg-gray-950 text-white overflow-hidden">
      {/* <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg h-[80vh] relative">

            <Chat
              showChat={showChat}
              setShowChat={setShowChat}
              userDoc={userDoc}
              currentUser={currentUser}
            />
          </div>
        </div> */}

      {/* Fixed Navbar */}
      <PatientDashboardNavbar />
      <SaveStripePayment />

      <div className="relative z-10 flex flex-col lg:flex-row w-full flex-grow min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-0">
          <PatientSidebarMenu
            userDoc={userDoc}
            mode={mode}
            setMode={setMode}
            noteOpen={noteOpen}
            setNoteOpen={setNoteOpen}
          />
        </aside>

        {/* Mobile sidebar */}
        <div className="block lg:hidden w-80 pl-7">
          <PatientSidebarMenu
            userDoc={userDoc}
            mode={mode}
            setMode={setMode}
            noteOpen={noteOpen}
            setNoteOpen={setNoteOpen}
            compact
          />
        </div>

        {/* Main content area */}
        <main className="w-full h-full flex flex-col flex-grow min-h-0 overflow-hidden">
          <div className="flex flex-col items-center pr-10 justify-start flex-grow overflow-hidden">
            <PatientMeetingSetup
              mode={mode}
              noteOpen={noteOpen}
              setNoteOpen={setNoteOpen}
              userDoc={userDoc}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPatientDashboard;
