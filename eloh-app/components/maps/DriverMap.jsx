"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, messaging } from "@/db/client";
import { createAmbulanceMarker } from "@/lib/ambulance-actions/createAmbulanceMarker";
import { toastSuccess, toastError, toastInfo } from "@/helpers/toastHelper";
import { deleteDriverRoute, saveDriverRoute } from "@/helpers";
import { onMessage } from "firebase/messaging";

const DriverMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);

  /**
   * const [ambulanceRequest, setAmbulanceRequest] = useState({
  type: "ambulance_request",
  pickupAddress: "123 Main Street, Cape Town",
  fare: 250,
  distance: "12",
  duration: "20",
  pickupLat: -33.9258,
  pickupLng: 18.4232,
  tripId: "dummy-trip-001",
});

   */

  // FCM foreground listener
  // useEffect(() => {
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     if (
  //       payload?.data?.type === "ambulance_request" ||
  //       payload?.type === "NOTIFICATION_CLICK"
  //     ) {
  //       const requestData = {
  //         customerName: payload.data.customerName || "",
  //         pickupAddress: payload.data.pickupAddress || "Unknown",
  //         fare: parseFloat(payload.data.fare || "0"),
  //         distance: payload.data.distance || "0",
  //         duration: payload.data.duration || "0",
  //         pickupLat: parseFloat(payload.data.pickupLat || "0"),
  //         pickupLng: parseFloat(payload.data.pickupLng || "0"),
  //         type: payload.data.type,
  //       };
  //       setAmbulanceRequest(requestData);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          setAmbulanceRequest(event.data.data);
        }
      });
    }
  }, []);

  // Initialize map + continuous driver location update
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps not loaded yet");
      return;
    }

    if (!navigator.geolocation) {
      toastError("Geolocation not supported.", 5000);
      return;
    }

    const updateDriverLocation = async (coords) => {
      const location = { lat: coords.latitude, lng: coords.longitude };
      setCurrentLocation(location);

      // Initialize map if not yet initialized
      if (!map && mapRef.current) {
        const gMap = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
        });
        setMap(gMap);

        // Create initial marker
        const m = createAmbulanceMarker(location, gMap, "🚑", "Ambulance");
        setMarker(m);
      }

      // Update marker
      if (marker) {
        marker.setPosition(location);
        map?.panTo(location);
      }

      // Update Firestore
      try {
        const user = auth.currentUser;
        if (!user) return;
        const driverRef = doc(db, "drivers", user.uid);
        await updateDoc(driverRef, { location });
      } catch (err) {
        console.error("Failed to update driver location:", err);
      }
    };

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => updateDriverLocation(coords),
      (error) => toastError(`Geolocation error: ${error}`, 5000),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker]);

  const handleAcceptRequest = async (request) => {
    if (!map || !currentLocation)
      return toastError("Map or location not ready");

    if (directionsRenderer) directionsRenderer.setMap(null);
    const newRenderer = new window.google.maps.DirectionsRenderer();
    newRenderer.setMap(map);
    setDirectionsRenderer(newRenderer);

    const user = auth.currentUser;
    if (!user) return toastError("User not authenticated");

    const origin = currentLocation;
    const destination = {
      lat: parseFloat(request.pickupLat),
      lng: parseFloat(request.pickupLng),
    };

    await saveDriverRoute(user.uid, { origin, destination });

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") newRenderer.setDirections(result);
        else toastError("Failed to create route");
      }
    );

    setAmbulanceRequest(null);
  };

  const handleCancelRoute = async () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    setDirectionsRenderer(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const routesRef = collection(db, "drivers", user.uid, "routes");
      const q = query(routesRef, orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return toastError("No route found");

      const routeDoc = snapshot.docs[0];
      await deleteDriverRoute(user.uid, routeDoc.id);
      toastInfo("Route cancelled");
    } catch (err) {
      console.error(err);
      toastError("Error cancelling the route");
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-[60%] bg-white rounded-2xl shadow-md p-6 mb-4 mt-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Driver Dashboard
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={handleCancelRoute}
            className="flex-1 bg-[#fb5607] hover:bg-[#f48c06] text-white font-semibold py-2 px-4 rounded-lg"
          >
            Cancel Route
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-[90%] h-[400px] rounded-lg overflow-hidden"
      />

      {ambulanceRequest && (
        <div className="fixed bottom-10 right-10 bg-white rounded-lg shadow-lg p-6 w-[400px] z-50">
          <h3 className="text-lg font-bold mb-2">New Ambulance Request</h3>
          <p>
            <strong>Customer Name:</strong> {ambulanceRequest.customerName}
          </p>
          <p>
            <strong>Pickup Location:</strong> {ambulanceRequest.pickupAddress}
          </p>
          <p>
            <strong>Fare:</strong> R{ambulanceRequest.fare}
          </p>
          <p>
            <strong>Distance:</strong> {ambulanceRequest.distance} km
          </p>
          <p>
            <strong>Duration:</strong> {ambulanceRequest.duration} min
          </p>
          <div className="flex justify-end mt-4 space-x-4">
            <button
              onClick={() => handleAcceptRequest(ambulanceRequest)}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => setAmbulanceRequest(null)}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMap;
