"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/db/client";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NurseDashboardNavbar from "@/app/dashboard/nurse/nurseNav";
import NurseSidebarMenu from "./nurseSidebar"; // New sidebar component
import Link from "next/link";

const NurseCollectionViewer = () => {
  const [userDoc, setUserDoc] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndPatients = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user.uid;
        const nurseRef = doc(db, "nurses", userId);
        const nurseSnap = await getDoc(nurseRef);

        if (nurseSnap.exists()) {
          const userDataRaw = nurseSnap.data();
          const userData = {
            ...userDataRaw,
            createdAt: convertTimestamp(userDataRaw.createdAt),
            updatedAt: convertTimestamp(userDataRaw.updatedAt),
          };
          setUserDoc(userData);
        }

        const patientsSnap = await getDocs(collection(db, "patients"));
        const patientsList = patientsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt),
        }));

        setPatients(patientsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchUserDataAndPatients();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <NurseDashboardNavbar />
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-16">
          <div className="text-center text-gray-600">Loading dashboard...</div>
        </div>
      </>
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
            <Link href="/sign-in?role=nurse">
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
      <NurseDashboardNavbar />

      <div className="relative z-10 flex flex-col lg:flex-row w-full bg-gray-950 flex-grow">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-1/4 lg:min-h-[calc(100vh-5rem)]">
          <NurseSidebarMenu
            practiceNumber={practiceNumber}
            isVerified={isVerified}
            userDoc={userDoc}
          />
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 p-6 flex flex-col items-center justify-start text-center bg-transparent">
          {isVerified === true ? (
            <>
              <h1 className="bg-gradient-to-r from-teal-300 via-blue-400 to-purple-500 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight mt-10 mb-10">
                Welcome Nurse!
              </h1>

              {/* Mobile Sidebar under main content */}
              <div className="block lg:hidden w-80 mt-10">
                <NurseSidebarMenu
                  practiceNumber={practiceNumber}
                  isVerified={isVerified}
                  userDoc={userDoc}
                  compact
                />
              </div>
            </>
          ) : isVerified === false ? (
            <div className="text-gray-600 text-center">
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
              <p>Please contact support to verify your practice information.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NurseCollectionViewer;
