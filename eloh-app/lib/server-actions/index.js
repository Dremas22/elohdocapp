"use server";

import { db } from "@/db/server";

/**
 * Find nearest available driver using Admin SDK
 * @param {{lat:number, lng:number}} pickupLocation
 * @param {string[]} excludeDriverIds
 * @returns {Promise<object|null>}
 */
export async function findNearestAvailableDriverServer(
  pickupLocation,
  excludeDriverIds = []
) {
  if (!pickupLocation?.lat || !pickupLocation?.lng) return null;

  const driversRef = db?.collection("drivers");
  const snapshot = await driversRef.where("available", "==", true).get();

  let nearestDriver = null;
  let minDistance = Infinity;

  snapshot.forEach((docSnap) => {
    if (excludeDriverIds.includes(docSnap.id)) return;

    const driverData = docSnap.data();
    let driverLat = driverData.location?.lat ?? driverData.location?.latitude;
    let driverLng = driverData.location?.lng ?? driverData.location?.longitude;

    if (driverLat == null || driverLng == null) return;

    const dist = calculateDistance(pickupLocation, {
      lat: driverLat,
      lng: driverLng,
    });

    if (dist < minDistance) {
      minDistance = dist;
      nearestDriver = { id: docSnap.id, ...driverData, distance: dist };
    }
  });

  return nearestDriver;
}

/**
 * Haversine formula to calculate distance in km
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

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
