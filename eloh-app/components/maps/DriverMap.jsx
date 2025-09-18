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
  getDoc,
  setDoc,
  onSnapshot,
  where,
} from "firebase/firestore";
import { auth, db } from "@/db/client";
import { createAmbulanceMarker } from "@/lib/ambulance-actions/createAmbulanceMarker";
import { toastError, toastInfo, toastSuccess } from "@/helpers/toastHelper";
import { deleteDriverRoute } from "@/helpers";
import AmbulanceDriverDashboardNavbar from "@/app/dashboard/driver/driverNav";
import DriverSidebarMenu from "@/app/dashboard/driver/driverSidebar";
import ActiveRequest from "../driver/ActiveRequest";
import AmbulanceRequest from "../driver/AmbulanceRequest";
import sendArrivalCodeEmail from "@/lib/sendCode";
import useCurrentUser from "@/hooks/useCurrentUser";
import confirmPayment from "@/lib/confirmPayment";
import { FiLoader } from "react-icons/fi";

const DriverMap = ({ userDoc, isVerified, setShowEarnings }) => {
  // References & states
  const mapRef = useRef(null); // DOM ref for the map container
  const [map, setMap] = useState(null); // Google map instance
  const [marker, setMarker] = useState(null); // Ambulance marker
  const [currentLocation, setCurrentLocation] = useState(null); // Driver's real-time location
  const [directionsRenderer, setDirectionsRenderer] = useState(null); // Directions display
  const [ambulanceRequest, setAmbulanceRequest] = useState(null); // Incoming requests
  const [excludedDrivers, setExcludedDrivers] = useState([]); // Drivers declined for current request
  const [activeRequest, setActiveRequest] = useState(null); // Request currently being serviced
  const [showCodeInput, setShowCodeInput] = useState(false); // Whether to show code input
  const [enteredCode, setEnteredCode] = useState(""); // Input from driver
  const [verifying, setVerifying] = useState(false);
  const { currentUser } = useCurrentUser();

  // Listen to latest trips for the current driver
  useEffect(() => {
    if (!currentUser?.uid) return;

    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("driverId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setAmbulanceRequest(null);
          return;
        }

        const tripDoc = snapshot.docs[0];
        const trip = { id: tripDoc.id, ...tripDoc.data() };

        // Show code input if showInput is true
        setShowCodeInput(trip.showInput ?? false);

        if (
          (trip?.pickupLocation || trip?.origin) &&
          (trip?.hospital || trip?.destination) &&
          trip?.isPaid &&
          trip?.status !== "completed" &&
          trip?.status !== "driver_arrived"
        ) {
          setAmbulanceRequest(trip);
        }

        // Persist activeRequest if trip is paid and not completed
        if (trip?.isPaid && trip?.status === "driver_arrived") {
          setActiveRequest(trip);
        }
      },
      (error) => {
        console.error("Error fetching driver trips:", error);
        toastError("Failed to fetch trips.");
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, map]);

  // Handle push notifications from service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          setAmbulanceRequest(event.data.data);
        }
      });
    }
  }, []);

  // Initialize map and update driver's real-time location
  useEffect(() => {
    if (!navigator.geolocation) {
      toastError("Geolocation not supported.", 5000);
      return;
    }

    const updateDriverLocation = async (coords) => {
      const location = { lat: coords.latitude, lng: coords.longitude };
      setCurrentLocation(location);

      // Initialize map on first location update
      if (!map && mapRef.current) {
        const gMap = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
        });
        setMap(gMap);

        // Create custom ambulance marker
        const m = createAmbulanceMarker(location, gMap, "🚑", "Ambulance");
        setMarker(m);
      }

      // Update marker and pan map
      if (marker) {
        marker.setPosition(location);
        map?.panTo(location);
      }

      // Update driver's location in Firestore
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
      (error) => console.error(`Geolocation error: ${error}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker]);

  // Accept an ambulance request
  const handleAcceptRequest = async (request) => {
    if (!map || !currentLocation)
      return toastError("Map or location not ready");

    if (directionsRenderer) directionsRenderer.setMap(null);
    const newRenderer = new window.google.maps.DirectionsRenderer();
    newRenderer.setMap(map);
    setDirectionsRenderer(newRenderer);

    if (!currentUser) return toastError("User not authenticated");

    const origin = currentLocation;
    const destination = {
      lat: parseFloat(
        request?.pickupLat ||
          request?.destination.lat ||
          request?.pickupLocation?.lat
      ),
      lng: parseFloat(
        request?.pickupLng ||
          request?.destination?.lng ||
          request?.pickupLocation?.lng
      ),
    };

    try {
      const tripRef = doc(db, "trips", request?.customerId);
      await updateDoc(tripRef, {
        driverId: request?.driverId,
        status: "accepted",
        origin,
        destination,
        acceptedAt: new Date(),
      }).catch(async () => {
        await setDoc(tripRef, {
          driverId: request?.driverId,
          customerId: request?.customerId,
          status: "accepted",
          origin,
          destination,
          createdAt: new Date(),
          acceptedAt: new Date(),
        });
      });
    } catch (err) {
      console.error("Failed to create/update trip doc:", err);
      toastError("Failed to save trip info");
    }

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

    setActiveRequest({ ...request, driverId: currentUser?.uid });
    setAmbulanceRequest(null);
  };

  // Cancel current route
  const handleCancelRoute = async () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    setDirectionsRenderer(null);
    setActiveRequest(null);

    try {
      if (!currentUser) throw new Error("User not authenticated");

      const routesRef = collection(db, "trips", currentUser.uid);
      const q = query(routesRef, orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return toastError("No route found");

      const routeDoc = snapshot.docs[0];
      await deleteDriverRoute(currentUser.uid, routeDoc.id);
      toastInfo("Route cancelled");
    } catch (err) {
      console.error(err);
      toastError("Error cancelling the route");
    }
  };

  // End trip & send arrival code
  const handleTripEnded = async () => {
    if (!activeRequest || !currentUser) return;

    try {
      const tripId = activeRequest?.customerId;
      const code = await sendArrivalCodeEmail(activeRequest);

      setShowCodeInput(true);
      toastSuccess("Code sent to customer");

      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        arrivalCode: code,
        status: "driver_arrived",
        arrivedAt: new Date(),
        showInput: true,
      });

      toastSuccess(
        "Arrival code has been generated and shared with the customer."
      );
    } catch (err) {
      console.error("Failed to send arrival code:", err.message);
      toastError("Failed to notify customer.");
    }
  };

  // Decline an ambulance request and reassign
  const handleDecline = async () => {
    if (!ambulanceRequest) return;

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
      sessionId: ambulanceRequest?.sessionId,
    };

    try {
      const nextDriver = await confirmPayment(
        ambulanceRequest?.sessionId,
        reqData,
        ambulanceRequest?.customerId,
        excludedDrivers
      );

      if (nextDriver) {
        await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/send-ambulance-notification`,
          {
            method: "POST",
            body: JSON.stringify({
              driverId: nextDriver?.userId || nextDriver?.id,
              tripDetails: reqData,
              customerId: auth?.currentUser?.uid,
              excludedDrivers: updatedExclusions,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        toastInfo(`Request reassigned to driver ${nextDriver.id}`);
      } else {
        toastInfo("No other available drivers nearby.");
      }
    } catch (err) {
      console.error("Error reassigning request:", err);
      toastError("Failed to reassign request.");
    }

    setAmbulanceRequest(null); // Clear current view
  };

  // Verify arrival code entered by driver
  const handleCodeVerification = async () => {
    setVerifying(true);
    try {
      const tripId = activeRequest?.customerId;
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      const data = tripSnap.data();

      if (!tripSnap.exists() || !data) {
        toastError("Trip not found");
        return;
      }

      if (enteredCode === data.arrivalCode) {
        await updateDoc(tripRef, {
          status: "completed",
          arrivalCode: null,
          isPaid: false,
          sessionId: null,
          isRatings: true,
          updatedAt: new Date(),
          showInput: false,
        });

        const driverId = data.driverId || currentUser?.uid;
        if (!driverId) return toastError("Driver ID missing");

        const driverRef = doc(db, "drivers", driverId);
        const driverSnap = await getDoc(driverRef);
        const driverData = driverSnap.exists() ? driverSnap.data() : {};

        const previousEarnings = parseFloat(driverData.earnings || 0);
        const previousTrips = parseInt(driverData.numberOfTrips || 0);
        const fare = parseFloat(activeRequest?.fare || 0);

        await setDoc(
          driverRef,
          {
            earnings: previousEarnings + fare,
            numberOfTrips: previousTrips + 1,
            totalPlatformFees: (driverData.totalPlatformFees || 0) + fare * 0.1,
            earningsUpdatedAt: new Date(),
          },
          { merge: true }
        );

        // ✅ Clear map directions
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
          setDirectionsRenderer(null);
        }

        toastSuccess("Trip successfully completed!");
        setActiveRequest(null);
        setAmbulanceRequest(null);
        setShowCodeInput(false);
      } else {
        toastError("Incorrect code. Please try again.");
      }
    } catch (err) {
      console.error("Verification failed:", err.message);
      toastError("Failed to verify code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex h-[690px] w-full sm:ml-10 bg-gray-100 relative">
      {/* Sidebar */}
      <DriverSidebarMenu
        userDoc={userDoc}
        setShowEarnings={setShowEarnings}
        isVerified={isVerified}
      />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <AmbulanceDriverDashboardNavbar />

        {/* Map and content container */}
        <div className="flex-1 flex flex-col items-center w-full">
          {/* Map stretches to fill available space */}
          <div
            ref={mapRef}
            className="lg:w-[330vh] w-[45vh] sm:w-[95vh] h-[130px] lg:mt-15 mt-5 max-w-6xl lg:ml-70 -ml-2  flex-1 rounded-lg shadow-lg overflow-hidden mx-auto"
          />

          {/* Incoming ambulance request */}
          {ambulanceRequest && (
            <AmbulanceRequest
              ambulanceRequest={ambulanceRequest}
              handleDecline={handleDecline}
              handleAcceptRequest={handleAcceptRequest}
            />
          )}

          {/* Active trip display */}
          {activeRequest && (
            <ActiveRequest
              activeRequest={activeRequest}
              handleCancelRoute={handleCancelRoute}
              onTripEnded={handleTripEnded}
            />
          )}

          {/* Arrival code verification overlay */}
          {showCodeInput && (
            <div className="fixed inset-0 z-[9999] bg-black bg-opacity-30 flex items-end justify-end p-6 pointer-events-auto">
              <div className="bg-white p-4 rounded-xl shadow-lg w-72 flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Enter arrival code from customer:
                </label>
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="border p-2 rounded text-sm text-gray-700 w-full"
                  placeholder="6-digit code"
                />
                <button
                  onClick={async () => await handleCodeVerification()}
                  disabled={verifying}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2 text-white">
                      <FiLoader className="animate-spin h-5 w-5" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
