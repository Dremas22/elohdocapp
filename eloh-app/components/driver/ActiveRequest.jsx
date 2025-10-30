"use client";
import { db } from "@/db/client";
import { toastError, toastSuccess } from "@/helpers/toastHelper";
import { useUserStore } from "@/hooks/useUserStore";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ActiveRequest Component
 *
 * Displays a floating popup for drivers with an active ambulance trip.
 * Allows the driver to mark the trip as "arrived", updating the trip status in Firestore.
 *
 * @param {Object} props - Component props
 * @param {Object} props.activeRequest - Optional prop representing the active request
 *
 * @returns {JSX.Element|null} - Returns the active trip UI if a trip is accepted, otherwise null.
 */
const ActiveRequest = ({ activeRequest }) => {
  const { currentUser } = useUserStore();
  const [tripId, setTripId] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setTrip({ id: tripDoc.id, ...tripDoc.data() });
      } else {
        setTripId(null);
        setTrip(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.userId]);

  const handleArrived = async () => {
    if (!tripId) return;
    setLoading(true);

    try {
      const driverId = trip?.driverId;
      const fare = trip?.fare ?? 0; // Ensure fare is a number

      if (!driverId) {
        toastError("Driver ID not found", 5000);
        return;
      }

      const tripRef = doc(db, "trips", tripId);
      const driverRef = doc(db, "drivers", driverId);

      // Update the trip status
      await updateDoc(tripRef, {
        sessionId: null,
        isPaid: false,
        status: "completed",
        arrivedAt: new Date(),
      });

      // Read current driver data
      const driverSnap = await getDoc(driverRef);
      if (!driverSnap.exists()) {
        toastError("Driver not found", 5000);
        return;
      }

      const driverData = driverSnap.data();
      const currentEarnings = driverData.earnings ?? 0;
      const currentTrips = driverData.numberOfTrips ?? 0;
      const currentPlatformFees = driverData.totalPlatformFees ?? 0;

      const platformFee = fare * 0.1;
      const driverEarnings = fare - platformFee;

      // Update driver document
      await updateDoc(driverRef, {
        earnings: currentEarnings + driverEarnings,
        earningsUpdatedAt: new Date(),
        numberOfTrips: currentTrips + 1,
        totalPlatformFees: currentPlatformFees + platformFee,
      });

      toastSuccess("Trip completed successfully!");
      router.refresh();
    } catch (err) {
      console.error("❌ Error updating trip or driver:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!tripId) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 animate-slide-up w-[95%] max-w-sm mx-auto sm:bottom-10 sm:right-10">
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
