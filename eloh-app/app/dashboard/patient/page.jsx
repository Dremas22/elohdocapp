"use client";

import { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import PatientMeetingSetup from "@/components/patients/PatientMeetingSetup";
import PatientDashboardNavbar from "@/app/dashboard/patient/patientNav";
import PatientSidebarMenu from "./patientSidebar";
import useCurrentUser from "@/hooks/useCurrentUser";
import SaveStripePayment from "@/components/SaveStripePayment";
import { useRouter } from "next/navigation";
import { db } from "@/db/client";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const PatientDashboard = () => {
  const { currentUser, loading } = useCurrentUser();
  const [userDoc, setUserDoc] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showPayButton, setShowPayButton] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [mode, setMode] = useState("general-notes");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkConsultations = async () => {
      try {
        if (!loading && currentUser?.uid) {
          setIsLoading(true);
          const userRef = doc(db, "patients", currentUser?.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();

          const consultations = userData?.numberOfConsultations || 0;

          if (consultations >= 1) {
            toast.info(
              "You already have consultations available. Redirecting..."
            );
            setShowPayButton(false);
          }
        }
      } catch (error) {
        console.error("Something went wrong while checking user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsultations();
  }, [currentUser?.uid]);

  useEffect(() => {
    setUserLoading(true);
    const fetchUserDoc = async () => {
      if (!currentUser?.uid) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/patients/${currentUser?.uid}`
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
            <Link href="/sign-in?role=patient">
              <span className="inline-block mt-4 text-blue-600 hover:underline">
                Go to Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-18 relative sm:h-[50vh] h-[145vh] bg-gray-950 text-white overflow-hidden">
      {/* Fixed Navbar */}
      <PatientDashboardNavbar />
      <SaveStripePayment />
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full flex-grow">
        {/* Desktop sidebar menu */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(50vh-5rem)]">
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
          <div className="flex flex-col sm:mr-28 items-center justify-start flex-grow">
            <PatientMeetingSetup
              mode={mode}
              noteOpen={noteOpen}
              setNoteOpen={setNoteOpen}
              userDoc={userDoc}
            />
          </div>
        </main>
      </div>
      {showPayButton && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <button
            onClick={() => router.push("/payment")}
            className="bg-white text-black px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition"
          >
            Go to Payment
          </button>
        </div>
      )}
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
