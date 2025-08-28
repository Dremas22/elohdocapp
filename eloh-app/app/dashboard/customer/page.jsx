"use client";

import CustomerMap from "@/components/maps/CustomerMap";
import Script from "next/script";
import CustomerDashboardNavbar from "./CustomerDashboardNavbar";
import { useEffect, useState } from "react";
import { auth, db } from "@/db/client";
import { doc, getDoc } from "firebase/firestore";
import { toastError } from "@/helpers/toastHelper";
import { useUserStore } from "@/hooks/useUserStore";

const CustomerDashboard = () => {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserInfo } = useUserStore();

  useEffect(() => {
    const fetchUserDoc = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "customers", user.uid));
        if (docSnap.exists()) {
          setUserDoc(docSnap.data());
          fetchUserInfo(docSnap.data());
        }
      } catch {
        toastError(`Error fetching customer data: `);
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(fetchUserDoc);
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen text-black">
      <>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive" // or "afterInteractive"
          onError={() => console.error("Google Maps script failed to load")}
        />
        <CustomerDashboardNavbar userDoc={userDoc} loading={loading} />
        <CustomerMap userDoc={userDoc} />
      </>
    </div>
  );
};

export default CustomerDashboard;
