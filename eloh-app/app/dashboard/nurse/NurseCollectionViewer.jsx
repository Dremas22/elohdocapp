"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/db/client";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Image from "next/image";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NurseDashboardNavbar from "@/components/navbar/nurseNav";

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
          const userDataRaw = docSnap.data();
          const userData = {
            ...userDataRaw,
            createdAt: convertTimestamp(userDataRaw.createdAt),
            updatedAt: convertTimestamp(userDataRaw.updatedAt),
          };
          setUserDoc(userData);
        } else {
          console.warn("Nurse document not found.");
        }

        const patientsSnap = await getDocs(collection(db, "patients"));
        const patientsList = patientsSnap.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
          };
        });

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
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!userDoc) {
    return (
      <>
        <NurseDashboardNavbar />
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-16">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
          </div>
        </div>
      </>
    );
  }

  const { photoUrl, practiceNumber, isVerified, fullName, email } = userDoc;

  return (
    <>
      <NurseDashboardNavbar />
      <div className="flex min-h-screen pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow p-4 space-y-4">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-300" />
          )}
          <div className="text-center">
            <p className="font-semibold text-gray-900">{fullName || email}</p>
            <p className="text-sm text-gray-500">
              Practice No: {practiceNumber || "N/A"}
            </p>
          </div>

          {isVerified === false && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-sm p-2 rounded">
              Your account is pending verification.
            </div>
          )}
          {isVerified === null && (
            <div className="bg-red-100 text-red-800 border border-red-800 text-sm p-2 rounded">
              Your verification was declined.
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isVerified === true ? (
            <div>
              <h1 className="text-xl font-semibold mb-4">Patient Info</h1>
              {patients.length > 0 ? (
                <pre className="bg-gray-100 p-4 rounded text-sm text-gray-800 overflow-auto whitespace-pre-wrap border border-gray-200 shadow-sm max-h-96">
                  {JSON.stringify(patients, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-600">No patients found.</p>
              )}
            </div>
          ) : (
            <div className="text-center mt-12 text-gray-600">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll be able to access
                sensitive patient information here.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default NurseCollectionViewer;
