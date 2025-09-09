"use client";

import CustomerMap from "@/components/maps/CustomerMap";
import Script from "next/script";
import CustomerDashboardNavbar from "./CustomerDashboardNavbar";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/db/client";
import { doc, onSnapshot } from "firebase/firestore";
import { toastError } from "@/helpers/toastHelper";
import { useUserStore } from "@/hooks/useUserStore";
import useCurrentUser from "@/hooks/useCurrentUser";

const CustomerDashboard = () => {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserInfo, currentUser: customer } = useUserStore();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "customers", currentUser?.uid);

    // 🔹 Subscribe to live updates
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const resp = { id: docSnap.id, ...docSnap.data() };
          console.log({ resp, customer }, "DATA_CUSTOMER_USER-DOC");
          setUserDoc(resp.data);
          fetchUserInfo(resp);
        } else {
          console.warn(
            "Customer document not found for user:",
            currentUser.uid
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error("Live update error:", err);
        toastError("Error fetching customer data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, fetchUserInfo]);

  return (
    <div className="flex flex-col w-full min-h-screen text-black">
      {/* Google Maps loader */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
        onError={() => console.error("Google Maps script failed to load")}
      />

      {/* Navbar */}
      <CustomerDashboardNavbar userDoc={userDoc} loading={loading} />

      {/* Map content */}
      <div className="flex flex-1 items-center justify-center h-full">
        <Suspense fallback={<div>Loading map...</div>}>
          <CustomerMap userDoc={userDoc || customer} />
        </Suspense>
      </div>
    </div>
  );
};

export default CustomerDashboard;
