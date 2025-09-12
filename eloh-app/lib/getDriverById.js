import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/db/client";

/**
 * Fetch latest trip for a customer and the corresponding driver
 * @param {string} userId - customer UID
 * @returns {Promise<{ trip: object|null, driver: object|null }>}
 */
export const getLatestTripWithDriver = async (userId) => {
  if (!userId) return { trip: null, driver: null };

  try {
    // 1️⃣ Get latest trip for this customer
    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("customerId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const tripSnapshot = await getDocs(q);

    if (tripSnapshot.empty) return { trip: null, driver: null };

    const trip = tripSnapshot.docs[0].data();

    // 2️⃣ Get driverId from trip
    const driverId = trip.driverId;
    if (!driverId) return { trip, driver: null };

    // 3️⃣ Fetch driver document
    const driverRef = doc(db, "drivers", driverId);
    const driverSnap = await getDoc(driverRef);

    const driver = driverSnap.exists() ? driverSnap.data() : null;

    return { trip, driver };
  } catch (err) {
    console.error("Failed to fetch trip or driver:", err);
    return { trip: null, driver: null };
  }
};
