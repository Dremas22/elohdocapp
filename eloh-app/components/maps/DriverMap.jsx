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
import { deleteDriverRoute, findNearestAvailableDriver } from "@/helpers";

import AmbulanceDriverDashboardNavbar from "@/app/dashboard/driver/driverNav";
import DriverSidebarMenu from "@/app/dashboard/driver/driverSidebar";
import ActiveRequest from "../driver/ActiveRequest";
import AmbulanceRequest from "../driver/AmbulanceRequest";
import sendArrivalCodeEmail from "@/lib/sendCode";
import useCurrentUser from "@/hooks/useCurrentUser";

const DriverMap = ({ userDoc, isVerified, setShowEarnings }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [excludedDrivers, setExcludedDrivers] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [arrivalCode, setArrivalCode] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const { currentUser } = useCurrentUser();

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

        // Optional: you can remove isPaid check during debugging
        if (
          (trip?.pickupLocation || trip?.origin) &&
          (trip?.hospital || trip?.destination) &&
          trip?.isPaid
        ) {
          setAmbulanceRequest(trip);
        } else {
          return null;
        }
      },
      (error) => {
        console.error("Error fetching driver trips:", error);
        toastError("Failed to fetch trips.");
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, map]);

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

    // Create / update trip in Firestore
    try {
      const tripRef = doc(db, "trips", request?.customerId); // Using customerId as doc ID
      await updateDoc(tripRef, {
        driverId: request?.driverId,
        status: "accepted",
        origin,
        destination,
        acceptedAt: new Date(),
      }).catch(async (err) => {
        // If doc does not exist, create it
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

    setActiveRequest({ ...request, driverId: currentUser?.uid }); // Keep request visible
    setAmbulanceRequest(null); // Remove popup
  };

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

  const handleTripEnded = async () => {
    if (!activeRequest || !currentUser) return;

    try {
      const tripId = activeRequest?.customerId;
      const code = await sendArrivalCodeEmail(
        activeRequest,
        activeRequest?.customerEmail
      );

      setArrivalCode(code);
      setShowCodeInput(true);
      alert(`${code} here`);
      // Update Firestore with arrival code
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        arrivalCode: code,
        status: "driver_arrived",
        arrivedAt: new Date(),
      });

      // TODO: Send code to customer via push/email
      toastSuccess(`Code sent to customer email`);
    } catch (err) {
      console.error("Failed to send arrival code:", err.message);
      toastError("Failed to notify customer.");
    }
  };

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
    };

    try {
      /**
       * TODO: Make a fetch call to /api/confirm-ambulance-payment instead
       * of using the client use (await findNearestAvailableDriverServer())
       */
      const nextDriver = await findNearestAvailableDriver(
        pickupLocation,
        updatedExclusions
      );

      if (nextDriver) {
        // 🔄 Reassign trip to next driver
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/send-ambulance-notification`,
          {
            method: "POST",
            body: JSON.stringify({
              driverId: nextDriver?.userId || nextDriver?.id,
              tripDetails: reqData,
              customerId: auth?.currentUser?.uid,
              excludedDrivers: updatedExclusions, // ✅ Pass along the exclusions
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        toastInfo(`Request reassigned to driver ${nextDriver.id}`);
      } else {
        toastInfo("No other available drivers nearby.");
      }
    } catch (err) {
      console.error("Error reassigning request:", err);
      toastError("Failed to reassign request.");
    }

    // Clear current driver's view
    setAmbulanceRequest(null);
  };

  const handleCodeVerification = async () => {
    try {
      const tripId = activeRequest?.customerId;
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      const data = tripSnap.data();

      if (!tripSnap.exists() || !data) throw new Error("Trip not found");

      if (enteredCode === data.arrivalCode) {
        await updateDoc(tripRef, {
          status: "completed",
          arrivalCode: null,
          isPaid: false,
          updatedAt: new Date(),
        });
        toastSuccess("Trip successfully completed!");
        setActiveRequest(null);
        setShowCodeInput(false);
      } else {
        toastError("Incorrect code. Please try again.");
      }
    } catch (err) {
      console.error("Verification failed:", err.message);
      toastError("Failed to verify code.");
    }
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
              onTripEnded={handleTripEnded}
            />
          )}

          {showCodeInput && (
            <div className="fixed bottom-24 right-5 z-50 bg-white p-4 rounded-xl shadow-lg flex flex-col gap-2 w-64">
              <label className="text-sm font-medium text-gray-700">
                Enter arrival code from customer:
              </label>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="border p-2 rounded text-sm text-gray-700"
                placeholder="6-digit code"
              />
              <button
                onClick={async () => await handleCodeVerification()}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow text-sm font-semibold"
              >
                Verify Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
