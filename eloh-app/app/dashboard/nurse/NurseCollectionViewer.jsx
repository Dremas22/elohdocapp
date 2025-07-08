"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/db/client";
import Image from "next/image";
import NurseDashboardNavbar from "@/app/dashboard/nurse/nurseNav";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

function serializeData(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj?.toDate === "function") {
    return obj.toDate().toISOString();
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === "object") {
    if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
      return new Date(obj._seconds * 1000).toISOString();
    }

    const result = {};
    for (const key in obj) {
      result[key] = serializeData(obj[key]);
    }
    return result;
  }

  return obj;
}

const NurseCollectionViewer = ({ patients }) => {
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
      const role = "nurse";
      const collectionName = `${role}s`;

      try {
        const userRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userDataRaw = docSnap.data();
          const userData = {
            ...userDataRaw,
            createdAt: convertTimestamp(userDataRaw.createdAt),
            updatedAt: convertTimestamp(userDataRaw.updatedAt),
          };
          setUserDoc(userData);
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
      <>
        <NurseDashboardNavbar />
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-16">
          {/* pt-16 to push below fixed navbar */}
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
        {/* pt-16 to offset fixed navbar height */}

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

          {!isVerified && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-sm p-2 rounded">
              Your account is pending verification.
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isVerified ? (
            <div>
              <h1 className="text-xl font-semibold mb-4">Patient Info</h1>
              {/* TODO: Replace this with real patient data */}
              <p>This is where sensitive patient information would be shown.</p>
              <pre className="bg-gray-100 p-4 rounded text-sm text-gray-800 overflow-auto whitespace-pre-wrap border border-gray-200 shadow-sm max-h-96">
                {JSON.stringify(patients, null, 2)}
              </pre>
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
    </>
  );
};

export default NurseCollectionViewer;
