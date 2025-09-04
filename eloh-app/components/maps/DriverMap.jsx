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
import { auth, db, messagingPromise } from "@/db/client";
import { createAmbulanceMarker } from "@/lib/ambulance-actions/createAmbulanceMarker";
import { toastError, toastInfo } from "@/helpers/toastHelper";
import {
  deleteDriverRoute,
  findNearestAvailableDriver,
  saveDriverRoute,
} from "@/helpers";
import { onMessage } from "firebase/messaging";
import AmbulanceDriverDashboardNavbar from "@/app/dashboard/driver/driverNav";
import DriverSidebarMenu from "@/app/dashboard/driver/driverSidebar";
import ActiveRequest from "../driver/ActiveRequest";
import AmbulanceRequest from "../driver/AmbulanceRequest";

const DriverMap = ({ userDoc, isVerified, setShowEarnings }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [excludedDrivers, setExcludedDrivers] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    let unsubscribe = () => { };

    const setupMessaging = async () => {
      const messaging = await messagingPromise;

      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        if (payload?.data?.type === "ambulance_request") {
          const requestData = {
            customerName: payload.data.customerName || "",
            pickupAddress: payload.data.pickupAddress || "Unknown",
            fare: parseFloat(payload.data.fare || "0"),
            distance: payload.data.distance || "0",
            duration: payload.data.duration || "0",
            pickupLat: parseFloat(payload.data.pickupLat || "0"),
            pickupLng: parseFloat(payload.data.pickupLng || "0"),
            type: payload.data.type,
          };
          setAmbulanceRequest(requestData);
        }
      });
    };

    setupMessaging();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
    if (!navigator.geolocation) {
      toastError("Geolocation not supported.", 5000);
      return;
    }

    const updateDriverLocation = async (coords) => {
      const location = { lat: coords.latitude, lng: coords.longitude };
      setCurrentLocation(location);

      if (!map && mapRef.current) {
        const gMap = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
        });
        setMap(gMap);

        // ✅ ONLY create the custom ambulance marker, no default ping
        const m = createAmbulanceMarker(location, gMap, "🚑", "Ambulance");
        setMarker(m);
      }

      if (marker) {
        marker.setPosition(location);
        map?.panTo(location);
      }

      try {
        const user = auth.currentUser;
        if (!user) return;
        const driverRef = doc(db, "drivers", user.uid);
        await updateDoc(driverRef, { location });
      } catch (err) {
        console.error("Failed to update driver location:", err);
      }
    };

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

    setActiveRequest(request); // ✅ Keep request visible after acceptance
    setAmbulanceRequest(null); // remove the popup
  };

  const handleCancelRoute = async () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    setDirectionsRenderer(null);
    setActiveRequest(null);

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

  const handleDecline = async () => {
    if (!ambulanceRequest) return;

    // Add current driver to excluded list
    const currentDriverId = auth.currentUser?.uid;
    const updatedExclusions = [...excludedDrivers, currentDriverId];
    setExcludedDrivers(updatedExclusions);
    const pickupLocation = {
      lat: parseFloat(ambulanceRequest?.pickupLat),
      lng: parseFloat(ambulanceRequest?.pickupLng),
    };

    const reqData = {
      customerName: ambulanceRequest?.customerName,
      pickupAddress: ambulanceRequest?.pickupAddress,
      fare: parseFloat(ambulanceRequest?.fare),
      distance: ambulanceRequest?.distance,
      duration: ambulanceRequest?.duration,
      pickupLocation,
      type: ambulanceRequest?.type,
    };

    // Find next nearest driver
    const nextDriver = await findNearestAvailableDriver(
      pickupLocation,
      updatedExclusions
    );

    if (nextDriver) {
      // Send notification to driver
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/send-ambulance-notification`,
        {
          method: "POST",
          body: JSON.stringify({
            driverId: nextDriver?.userId || nextDriver?.id,
            tripDetails: reqData,
            customerId: auth?.currentUser?.uid,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        toastError(`Error: ${response.text()}`);
      }
      toastInfo(`Request reassigned to driver ${nextDriver.id}`);
    } else {
      toastInfo("No other available drivers nearby.");
    }

    // Optionally clear current request from this driver's view
    setAmbulanceRequest(null);
  };

  return (
    <div className="flex w-full h-full bg-gray-100 relative">

      {/* Sidebar */}
      <DriverSidebarMenu
        userDoc={userDoc}
        setShowEarnings={setShowEarnings}
        isVerified={isVerified}
      />

      <div className="flex-1 flex flex-col items-center">
        {/* Navbar */}
        <AmbulanceDriverDashboardNavbar />

        {/* Push content below fixed navbar */}
        <div className="w-full flex flex-col items-center mt-5 p-4">
          <div className="lg:w-[15%] w-[65%] bg-white rounded-2xl shadow-md lg:ml-60 p-6 mb-4">
            <div className="flex space-x-4">
              <button
                onClick={handleCancelRoute}
                className="bg-[#03045e] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex-1/2 cursor-pointer"
              >
                Cancel Route
              </button>
            </div>
          </div>

          {/* Map */}
          <div
            ref={mapRef}
            className="w-full max-w-6xl lg:ml-75 sm:ml-15 h-[480px] rounded-lg shadow-lg overflow-hidden"
          />

          {/* Ambulance Requests */}
          {ambulanceRequest && (
            <AmbulanceRequest
              ambulanceRequest={ambulanceRequest}
              handleDecline={handleDecline}
              handleAcceptRequest={handleAcceptRequest}
            />
          )}

          {activeRequest && (
            <ActiveRequest
              activeRequest={activeRequest}
              handleCancelRoute={handleCancelRoute}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
