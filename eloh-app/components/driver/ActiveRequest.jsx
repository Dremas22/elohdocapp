"use client";
import { db } from "@/db/client";
import { useUserStore } from "@/hooks/useUserStore";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const ActiveRequest = ({ activeRequest }) => {
  const { currentUser } = useUserStore();
  const [tripId, setTripId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.userId) return;

    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("driverId", "==", currentUser?.userId),
      where("status", "==", "accepted")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const tripDoc = snapshot.docs[0];
        setTripId(tripDoc.id);
      } else {
        setTripId(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.userId]);

  const handleArrived = async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        sessionId: null,
        isPaid: false,
        status: "completed",
        arrivedAt: new Date(),
      });
    } catch (err) {
      console.error("❌ Error updating trip:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!tripId) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-50 animate-slide-up
                 w-[95%] max-w-sm mx-auto sm:bottom-10 sm:right-10"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-green-600 p-3 sm:p-4 relative overflow-hidden">
        {/* Header */}
        <h3 className="text-base sm:text-lg text-center font-bold mb-3 text-black">
          🚑 Active Ambulance Trip
        </h3>

        {/* Content */}
        <p className="text-gray-700 text-sm text-center mb-4">
          You are currently on an active trip. Click below once you’ve arrived.
        </p>

        {/* Arrived Button */}
        <button
          onClick={handleArrived}
          disabled={loading}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Updating..." : "✅ Arrived"}
        </button>
      </div>
    </div>
  );
};

export default ActiveRequest;
