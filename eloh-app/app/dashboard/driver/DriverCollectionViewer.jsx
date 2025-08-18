"use client";

import Loading from "@/components/Loading";
import DriverMap from "@/components/maps/DriverMap";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import AmbulanceDriverDashboardNavbar from "./driverNav";
import DriverSidebarMenu from "./driverSidebar";
import Earnings from "../doctor/doctorEarnings";
import { FiX } from "react-icons/fi";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/db/client";

const DriverCollectionViewer = ({ userDoc, customers, userId }) => {
  const [mapsReady, setMapsReady] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [userDocState, setUserDoc] = useState(userDoc || {});

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(doc(db, "drivers", userId), (docSnap) => {
      if (docSnap.exists()) {
        const updatedData = docSnap.data();
        setUserDoc((prev) => ({
          ...prev,
          ...updatedData,
        }));
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // TODO: CUSTOMERS HERE
  console.log(customers, "CUSTOMERS");

  if (!userDocState) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20">
        <AmbulanceDriverDashboardNavbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-blue-600">
            <p className="text-lg font-medium">No user data found.</p>
            <p className="text-sm mt-1">
              Please make sure your account is registered correctly.
            </p>
            <div className="flex justify-center mt-6">
              <Link href="/sign-in?role=driver" passHref>
                <button className="bg-[#03045e] text-white py-3 px-6 text-xs md:text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center justify-center gap-1 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none">
                  Go to Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { isVerified } = userDocState;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-950">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setMapsReady(true)}
        onError={() => console.error("❌ Google Maps script failed to load")}
      />

      <AmbulanceDriverDashboardNavbar />

      <div className="flex flex-col lg:flex-row w-full flex-grow relative">
        {/* Sidebar only shows if verified */}

        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-[calc(100vh-5rem)] fixed top-20 left-0 z-20">
          <DriverSidebarMenu
            userDoc={userDocState}
            setShowEarnings={setShowEarnings}
            isVerified={isVerified}
          />
        </aside>

        {/* Main content */}
        <main className={`w-full flex flex-col items-center mt-16`}>
          {isVerified === true ? (
            <>
              {mapsReady ? (
                <div className="w-full min-h-screen relative">
                  <DriverMap
                    userDoc={userDocState}
                    isVerified={userDocState?.isVerified}
                    setShowEarnings={setShowEarnings}
                  />

                  {/* Earnings Modal */}
                  {showEarnings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md px-4">
                      <div className="bg-white text-black rounded-xl p-6 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd] overflow-auto">
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

                        <Earnings role="doctor" data={userDocState} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Loading message="Loading Map..." />
              )}
            </>
          ) : isVerified === false ? (
            <div className="text-gray-600 mt-10 text-center">
              <h2 className="text-lg font-semibold mb-2">
                Verification Pending
              </h2>
              <p>
                Once your account is verified, you'll access patient information
                here.
              </p>
            </div>
          ) : (
            <div className="text-red-600 mt-10 text-center">
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

export default DriverCollectionViewer;
