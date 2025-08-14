import { auth, db } from "@/db/client";
import { createAmbulanceMarker } from "@/lib/ambulance-actions/createAmbulanceMarker";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toastInfo, toastSuccess } from "./toastHelper";

const calculateDistance = (loc1, loc2) => {
  const R = 6371;
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const trackAmbulances = async (pickupLocation, map) => {
  try {
    const usersSnapshot = await getDocs(collection(db, "drivers"));

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const routesRef = collection(doc(db, "drivers", userId), "routes");
      const routeQuery = query(
        routesRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const routeSnapshot = await getDocs(routeQuery);

      if (routeSnapshot.empty) continue;

      const latestRoute = routeSnapshot.docs[0].data();
      const driverLocation = latestRoute.origin;

      if (
        !driverLocation ||
        driverLocation.lat === undefined ||
        driverLocation.lng === undefined
      ) {
        continue;
      }

      const distance = calculateDistance(pickupLocation, driverLocation);
      if (distance <= 30) {
        createAmbulanceMarker(driverLocation, map, "🚑", "Ambulance");

        toastSuccess(`🚑 Ambulance found within ${distance.toFixed(2)} km`);
      }
    }
  } catch (error) {
    console.error("Error tracking ambulances:", error.message);
  }
};

function startDriverLocationUpdates() {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  // Update every 10 seconds
  const UPDATE_INTERVAL = 10000;

  setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const driverId = auth.currentUser?.uid;
        if (!driverId) return;

        try {
          await updateDoc(doc(db, "drivers", driverId), {
            location: { lat: latitude, lng: longitude },
            lastUpdated: new Date(),
          });
        } catch (err) {
          console.error("Error updating driver location:", err);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );
  }, UPDATE_INTERVAL);
}

export default startDriverLocationUpdates;

// OPTIONAL: Find nearest hospitals using Google Places
export const findNearbyHospitals = async (
  location,
  radius = 45000,
  map = null
) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location,
      radius,
      type: ["hospital"],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const places = results.map((place) => ({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }));
        resolve(places);
      } else {
        reject(new Error("No hospitals found nearby"));
      }
    });
  });
};

export const getAddressFromLatLng = async (lat, lng) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    return data.results[0].formatted_address;
  }
  return null;
};

export async function findNearestAvailableDriver(pickupLocation) {
  if (!pickupLocation?.lat || !pickupLocation?.lng) {
    console.warn("Pickup location is missing latitude or longitude");
    return null;
  }

  // Query all available ambulance drivers
  const driversRef = collection(db, "drivers");
  const q = query(driversRef, where("available", "==", true)); // ensure field is boolean true
  const querySnapshot = await getDocs(q);

  let nearestDriver = null;
  let minDistance = Infinity;

  querySnapshot.forEach((docSnap) => {
    const driverData = docSnap.data();
    let driverLat, driverLng;

    // Handle both { lat, lng } objects and GeoPoint
    if (driverData.location?.lat != null && driverData.location?.lng != null) {
      driverLat = driverData.location.lat;
      driverLng = driverData.location.lng;
    } else if (
      driverData.location?.latitude != null &&
      driverData.location?.longitude != null
    ) {
      driverLat = driverData.location.latitude;
      driverLng = driverData.location.longitude;
    } else {
      console.warn(`Driver ${docSnap.id} has no valid location.`);
      return;
    }

    const dist = calculateDistance(pickupLocation, {
      lat: driverLat,
      lng: driverLng,
    });
    toastSuccess(`Driver ${docSnap.id} is ${dist.toFixed(2)} km away.`);

    if (dist < minDistance) {
      minDistance = dist;
      nearestDriver = { id: docSnap.id, ...driverData };
    }
  });

  if (!nearestDriver) {
    toastInfo("No drivers matched the location criteria.");
  }

  return nearestDriver;
}

export const saveCustomerRoute = async (userId, routeData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/ambulance/customers/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ routeData }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save route");
  }

  return await res.json();
};

export const deleteCustomerRoute = async (userId, routeId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/ambulance/customers/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ routeId }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete route");
  }

  return await res.json();
};

export const saveDriverRoute = async (userId, routeData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/ambulance/drivers/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ routeData }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save route");
  }

  return await res.json();
};

export const deleteDriverRoute = async (userId, routeId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/ambulance/drivers/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ routeId }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete route");
  }

  return await res.json();
};
