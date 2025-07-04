"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/db/client";
import DoctorDashboardNavbar from "@/components/navbar/doctorNav";
import PatientDisplay from "@/components/patients/PatientDisplay";

const DoctorsCollectionViewer = ({ patients }) => {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const role = "doctor";
      const collectionName = `${role}s`;

      try {
        const userRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserDoc(docSnap.data());
        } else {
          console.warn("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }

      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchUserData();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar at top */}
        <DoctorDashboardNavbar />

        {/* Centered message below navbar */}
        <div className="flex flex-1 items-center justify-center">
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

  const { practiceNumber, isVerified } = userDoc;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <DoctorDashboardNavbar />

      {/* Content area with sidebar and main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r shadow p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium">
              Practice No: {practiceNumber || "N/A"}
            </p>
          </div>

          {/* Verification Warning */}
          {!isVerified && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-sm p-2 rounded">
              Your account is pending verification.
            </div>
          )}

          {isVerified && (
            <div className="flex flex-col gap-4 pt-2">
              {[
                "Start Consultation",
                "Create Prescription",
                "Create Sick Note",
                "View Patient History",
              ].map((label) => (
                <button
                  key={label}
                  className="bg-[#03045e] text-white py-3 px-5 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isVerified ? (
            <div>
              <h1 className="text-xl font-semibold mb-4">Patient Info</h1>
              <p>This is where sensitive patient information would be shown.</p>
              <PatientDisplay patients={patients} />
            </div>
          ) : (
            <div className="text-center mt-12 text-gray-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you&apos;ll be able to access
                sensitive patient information here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorsCollectionViewer;
