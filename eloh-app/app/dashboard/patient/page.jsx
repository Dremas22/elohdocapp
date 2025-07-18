"use client";

import { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import PatientMeetingSetup from "@/components/patients/PatientMeetingSetup";
import PatientDashboardNavbar from "@/app/dashboard/patient/patientNav";
import PatientSidebarMenu from "./patientSidebar";
import useCurrentUser from "@/hooks/useCurrentUser";

const PatientDashboard = () => {
  const { currentUser, loading } = useCurrentUser();
  const [userDoc, setUserDoc] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [mode, setMode] = useState("general-notes");

  useEffect(() => {
    setUserLoading(true);
    const fetchUserDoc = async () => {
      if (!currentUser?.uid) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/patients/${currentUser.uid}`
        );
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to load user data.");
        setUserDoc(data);
      } catch (error) {
        console.error("Error fetching userDoc:", error);
      } finally {
        setUserLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchUserDoc();
    }
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
      <div className="min-h-screen bg-gray-50 pt-20">
        <PatientDashboardNavbar />
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

  return (
    <div className="min-h-screen flex flex-col pt-18 relative sm:h-[50vh] h-[145vh] bg-gray-950 text-white overflow-hidden">
      {/* Fixed Navbar */}
      <PatientDashboardNavbar />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full flex-grow">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(100vh-5rem)]">
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

        {/* Scrollable only on mobile */}
        <main
          className="w-full lg:w-3/4 flex flex-col overflow-y-auto lg:overflow-hidden"
          style={{ height: "calc(120vh - 5rem)" }} // Navbar height assumed ~5rem
        >
          <div className="flex flex-col items-center justify-start flex-grow">
            <PatientMeetingSetup
              mode={mode}
              noteOpen={noteOpen}
              setNoteOpen={setNoteOpen}
              userDoc={userDoc}
            />
          </div>
        </main>
      </div>

      {/* Floating Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto p-4">
            <Chat setShowChat={setShowChat} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
