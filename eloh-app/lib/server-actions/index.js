"use server";
import { db } from "@/db/server";

/**
 * Find the nearest available driver to a given pickup location.
 * Marks any drivers in `excludeDriverIds` as unavailable in the database.
 *
 * @param {{ lat: number; lng: number }} pickupLocation - Coordinates of the pickup location.
 * @param {string[]} [excludeDriverIds=[]] - Array of driver IDs who have declined or should be excluded.
 * @returns {Promise<{
 *   id: string;
 *   location?: { lat: number; lng: number };
 *   distance: number;
 *   [key: string]: any;
 * } | null>} Returns the nearest available driver object including distance, or null if none found.
 */
export async function findNearestAvailableDriverServer(
  pickupLocation,
  excludeDriverIds = []
) {
  if (!pickupLocation?.lat || !pickupLocation?.lng) return null;

  excludeDriverIds = (excludeDriverIds || []).map(String);

  const driversRef = db.collection("drivers");
  const snapshot = await driversRef.where("available", "==", true).get();

  let nearestDriver = null;
  let minDistance = Infinity;

  for (const docSnap of snapshot.docs) {
    const id = docSnap.id;

    // Skip and mark excluded drivers
    if (excludeDriverIds.includes(id)) {
      await driversRef
        .doc(id)
        .update({ available: false })
        .catch(console.error);
      continue;
    }

    const driverData = docSnap.data();
    const driverLat = parseFloat(
      driverData.location?.lat ?? driverData.location?.latitude
    );
    const driverLng = parseFloat(
      driverData.location?.lng ?? driverData.location?.longitude
    );

    if (isNaN(driverLat) || isNaN(driverLng)) continue;

    const dist = calculateDistance(pickupLocation, {
      lat: driverLat,
      lng: driverLng,
    });

    if (dist < minDistance) {
      minDistance = dist;
      nearestDriver = { id, ...driverData, distance: dist };
    }
  }

  return nearestDriver;
}

/**
 * Calculate the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param {{lat: number, lng: number}} loc1 - The first location (latitude and longitude in degrees)
 * @param {{lat: number, lng: number}} loc2 - The second location (latitude and longitude in degrees)
 * @returns {number} Distance between loc1 and loc2 in kilometers
 */
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLng = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(loc1.lat)) *
      Math.cos(deg2rad(loc2.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians.
 *
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
