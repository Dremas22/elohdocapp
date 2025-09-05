"use client";

import {
  deleteCustomerRoute,
  getAddressFromLatLng,
  saveCustomerRoute,
  trackAmbulances,
} from "@/helpers";
import { toastError, toastInfo } from "@/helpers/toastHelper";
import { createCustomerMarker } from "@/lib/ambulance-actions/createCustomerMarker";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "@/db/client";
import { FaLocationDot } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";
import PayAmbulance from "../ambulance/PayAmbulance";
import CustomerSidebarMenu from "@/app/dashboard/customer/CustomerSidebar";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";
import confirmPayment from "@/lib/confirmPayment";

const RATE_PER_KM = 10;

export default function CustomerMap({ userDoc }) {
  const mapRef = useRef(null);
  const pickupInputRef = useRef(null);
  const destInputRef = useRef(null);
  const paySectionRef = useRef(null);
  const { currentUser } = useCurrentUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");

  const [calculatingTrip, setCalculatingTrip] = useState(false);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupPlace, setPickupPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [routeReady, setRouteReady] = useState(false);
  const [fareDetails, setFareDetails] = useState(null);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [destMarker, setDestMarker] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    if (showPay && paySectionRef.current) {
      paySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showPay]);

  useEffect(() => {
    const confirmPay = async () => {
      if (!currentUser || !sessionId || type !== "ambulance_request") return;
      if (!sessionId.startsWith("cs_")) return;

      let tripData = fareDetails;

      // 🔹 Recover from localStorage if missing
      if (!tripData) {
        const stored = localStorage.getItem("fareDetails");
        if (stored) {
          tripData = JSON.parse(stored);
          setFareDetails(tripData); // sync back to state
        } else {
          console.warn("No fareDetails found for confirming payment");
          return;
        }
      }

      // 🔹 Add safe fallbacks for required fields
      tripData = {
        ...tripData,
        customerId: currentUser?.uid || userDoc?.userId,
        customerName:
          userDoc?.fullName || currentUser?.displayName || "Unknown",
        customerEmail:
          currentUser?.email || userDoc?.email || "unknown@email.com",
        destination:
          destinationPlace || tripData?.hospital || tripData?.destination,
        type: "ambulance_request",
        pickupLocation: pickupPlace,
      };

      // Small delay so Firestore writes can settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      await confirmPayment(sessionId, tripData, tripData.customerId);

      // Clean URL so refresh doesn’t confirm again
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      localStorage.removeItem("fareDetails");
    };

    confirmPay();
  }, [currentUser, sessionId, type, fareDetails]);

  // Initialize map + autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google maps not loaded");
      return;
    }

    // get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          setCurrentLocation(loc);
          setPickupPlace(loc); // default pickup = current location

          const gMap = new window.google.maps.Map(mapRef.current, {
            center: loc,
            zoom: 13,
            mapTypeId: "roadmap",
            styles: [
              // ensure POI/places are visible
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
              {
                featureType: "poi.business",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
              {
                featureType: "poi.medical",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
            ],
          });

          setMap(gMap);
          // initial customer marker
          createCustomerMarker(loc, gMap, "🧍", "Customer (You)");

          // Setup pickup autocomplete
          const pickupAutocomplete = new window.google.maps.places.Autocomplete(
            pickupInputRef.current,
            { types: ["geocode"] }
          );
          pickupAutocomplete.setFields([
            "geometry",
            "formatted_address",
            "name",
          ]);
          pickupAutocomplete.addListener("place_changed", () => {
            const place = pickupAutocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              alert("Pickup place has no geometry");
              return;
            }
            const p = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name,
            };
            setPickupPlace(p);
            // add marker
            if (pickupMarker) pickupMarker.setMap(null);
            const m = new window.google.maps.Marker({
              position: { lat: p.lat, lng: p.lng },
              map: gMap,
              title: "Pickup",
              label: { text: "P", fontSize: "14px" },
            });
            setPickupMarker(m);
            gMap.panTo({ lat: p.lat, lng: p.lng });
          });

          // Setup destination autocomplete (any place)
          const destAutocomplete = new window.google.maps.places.Autocomplete(
            destInputRef.current,
            { types: ["geocode", "establishment"] }
          );
          destAutocomplete.setFields(["geometry", "formatted_address", "name"]);
          destAutocomplete.addListener("place_changed", () => {
            const place = destAutocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              toastInfo("Destination has no geometry");
              return;
            }
            const d = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name,
              name: place.name,
            };
            setDestinationPlace(d);

            // place marker
            if (destMarker) destMarker.setMap(null);
            const dm = new window.google.maps.Marker({
              position: { lat: d.lat, lng: d.lng },
              map: gMap,
              title: d.name || "Destination",
              label: { text: "D", fontSize: "14px" },
            });
            setDestMarker(dm);

            if (!locationLoading) {
              createRoute(currentLocation, d, gMap);
            }
          });
        },
        (err) => {
          console.error("Geolocation error:", err.message);
          // still initialize map with a fallback center
          const fallback = { lat: -26.2041, lng: 28.0473 }; // Joburg center fallback
          setCurrentLocation(fallback);
          setPickupPlace(fallback);

          const gMap = new window.google.maps.Map(mapRef.current, {
            center: fallback,
            zoom: 12,
            mapTypeId: "roadmap",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
              {
                featureType: "poi.business",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
              {
                featureType: "poi.medical",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
            ],
          });
          setMap(gMap);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fallback = { lat: -33.9249, lng: 18.4241 }; // Cape Town fallback

    const init = async () => {
      setLocationLoading(true);
      try {
        // 1. Init map immediately
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: fallback,
          zoom: 14,
        });
        setMap(mapInstance);

        // 2. Set fallback origin immediately
        setCurrentLocation(fallback);
        setPickupPlace(fallback);

        // 3. Try geolocation
        await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve();

          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const loc = { lat: coords.latitude, lng: coords.longitude };
              setCurrentLocation(loc);
              setPickupPlace(loc);
              mapInstance.setCenter(loc);
              resolve();
            },
            () => {
              console.warn("GPS failed, using fallback");
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setLocationLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("customerId", "==", currentUser?.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const trip = snapshot.docs[0].data();

      if (
        trip?.isPaid &&
        (trip?.pickupLocation || trip.origin) &&
        (trip?.hospital || trip?.destination)
      ) {
        // 👇 Recreate the route if trip is already paid
        createRoute(trip.pickupLocation, trip.hospital, map);
        setFareDetails(trip);
        setRouteReady(true);
      }
    });

    return () => unsubscribe();
  }, [map, currentUser?.uid]); // runs once map/currentUser is ready

  const handleCreateRoute = () => {
    if (!pickupPlace && !currentLocation)
      return toastError("Pickup location missing");
    if (!destinationPlace) return toastError("Destination missing");

    setCalculatingTrip(true);
    createRoute(pickupPlace || currentLocation, destinationPlace, map);
  };

  // createRoute function - draws route, calculates distance/duration/fare, saves to firestore
  function createRoute(origin, destination, gMap = map) {
    setLocationLoading(true);
    if (!gMap) {
      console.error("Map not ready");
      setCalculatingTrip(false);
      return;
    }
    if (!origin || !destination) {
      toastError("Origin or destination missing");
      return;
    }

    try {
      // clear previous renderer
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(null);
      }

      const directionsService = new window.google.maps.DirectionsService();
      const renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
      });
      renderer.setMap(gMap);
      setDirectionsRenderer(renderer);

      const originParam =
        typeof origin.lat === "function" || origin.lat === undefined
          ? origin
          : { lat: origin.lat, lng: origin.lng };

      const destinationParam = { lat: destination.lat, lng: destination.lng };

      directionsService.route(
        {
          origin: originParam,
          destination: destinationParam,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        async (result, status) => {
          if (status === "OK") {
            renderer.setDirections(result);
            // pull leg info
            const leg = result.routes[0].legs[0];
            const distanceMeters = leg.distance?.value ?? 0;
            const durationSeconds = leg.duration?.value ?? 0;
            const distanceKm = distanceMeters / 1000;
            const durationMin = Math.round(durationSeconds / 60);
            const fare = (distanceKm * RATE_PER_KM).toFixed(2);

            const originAddress = await getAddressFromLatLng(
              origin.lat,
              origin.lng
            );
            const destinationAddress = await getAddressFromLatLng(
              destination.lat,
              destination.lng
            );

            const routeData = {
              origin: {
                lat: origin.lat,
                lng: origin.lng,
                address: originAddress,
              },
              destination: {
                lat: destination.lat,
                lng: destination.lng,
                address: destinationAddress,
              },
              distance: distanceKm.toFixed(2),
              duration: durationMin.toFixed(0),
              fare,
              customerId: currentUser?.uid || userDoc?.userId, // ✅ always set
              customerName:
                userDoc?.fullName || currentUser?.displayName || "Unknown", // ✅ fallback
              customerEmail:
                currentUser?.email || userDoc?.email || "unknown@email.com",
              pickupLocation: {
                lat: origin.lat,
                lng: origin.lng,
                address: originAddress,
              },
              hospital: {
                lat: destination.lat,
                lng: destination.lng,
                address: destinationAddress,
              },
              type: "ambulance_request",
            };

            // Save route to Firestore
            try {
              if (!currentUser) throw new Error("User not authenticated");
              await saveCustomerRoute(currentUser?.uid, routeData);

              // Save to localStorage for persistence across page reloads
              localStorage.setItem("fareDetails", JSON.stringify(routeData));
              // set UI
              setFareDetails(routeData);
              setRouteReady(true);
            } catch (saveErr) {
              console.error("Failed to save route:", saveErr.message);
              // still save locally so user can see cost even if save failed
              localStorage.setItem("fareDetails", JSON.stringify(routeData));
              // still set fareDetails so user can see cost even if save failed
              setFareDetails(routeData);
              setRouteReady(true);
            }

            // center map to route start
            if (pickupMarker) pickupMarker.setMap(gMap);
            if (destMarker) destMarker.setMap(gMap);
            gMap.panTo({ lat: destination.lat, lng: destination.lng });
          } else {
            console.error("Directions service failed:", status);
            alert("Unable to create route: " + status);
          }
          setCalculatingTrip(false);
          setLocationLoading(false);
        }
      );
    } catch (err) {
      console.error("createRoute error:", err.message);

      setLocationLoading(false);
      setCalculatingTrip(false);
    }
  }

  // Use current location button
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toastInfo("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setPickupPlace(loc);
        if (map) {
          map.panTo(loc);
          if (pickupMarker) pickupMarker.setMap(null);
          const m = new window.google.maps.Marker({
            position: loc,
            map,
            title: "Pickup (You)",
            label: { text: "P", fontSize: "14px" },
          });
          setPickupMarker(m);
        }
        // also set pickup input field text (try reverse geocode)
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: loc }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            if (pickupInputRef.current)
              pickupInputRef.current.value = results[0].formatted_address;
          } else {
            if (pickupInputRef.current)
              pickupInputRef.current.value = "Current Location";
          }
        });
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        alert("Unable to get your location.");
      }
    );
  };

  const handleCancelRoute = async () => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
    setFareDetails(null);
    setRouteReady(false);
    setDestinationPlace(null);
    if (destInputRef.current) destInputRef.current.value = "";
    try {
      if (!currentUser) throw new Error("User not authenticated");

      const routesRef = collection(db, "customers", currentUser?.uid, "routes");
      const q = query(routesRef, orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // nothing to delete
        return;
      }
      const routeDoc = snapshot.docs[0];
      await deleteCustomerRoute(user?.uid, routeDoc.id);
      alert("Route cancelled and removed from database.");
    } catch (err) {
      console.error("Cancel route failed:", err.message);
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center min-h-screen bg-gray-100 pt-20 lg:pl-66 p-4">
      {/* Sidebar */}
      <CustomerSidebarMenu userDoc={userDoc} />

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className=" text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          🚑 Request Ambulance
        </h2>

        {/* Pickup */}
        <label className="block text-lg sm:text-xl font-medium text-black mb-2">
          Pickup location
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative w-full">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              title="Where should we pick you up?"
              ref={pickupInputRef}
              type="text"
              placeholder="Enter pickup address or use current location"
              className="flex-1 p-3 pl-10 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <button
            title="Set pickup location to your current location"
            onClick={useMyLocation}
            className="bg-[#03045e] text-white font-semibold py-2 px-8 rounded-xl shadow-[0_4px_#999] 
             active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] 
             transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-2 -mt-2"
          >
            <FaLocationDot className="h-4 w-5" />
            <span>Use Current Location</span>
          </button>
        </div>

        {/* Destination */}
        <label className="block text-lg sm:text-xl font-medium text-black mb-2">
          Destination
        </label>
        <div className="relative mb-4">
          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            title="Where are you headed?"
            ref={destInputRef}
            type="text"
            placeholder="Type destination (clinic, hospital, address or any place)..."
            className="pl-10 p-3 border border-gray-300 text-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            title="Create route"
            onClick={handleCreateRoute}
            disabled={locationLoading}
            className={`flex-1 ${locationLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#03045e] hover:bg-[#023e8a]"
              } text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer`}
          >
            Create Route
          </button>

          <button
            title="Discard changes"
            onClick={handleCancelRoute}
            className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            Cancel Route
          </button>

          <button
            title="Track nearby ambulances"
            onClick={async () =>
              await trackAmbulances(
                destinationPlace || pickupPlace || currentLocation,
                map,
                450
              )
            }
            className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            Track Ambulances (450km)
          </button>
        </div>

        {/* Trip summary (distance/fare) */}
        {calculatingTrip && (
          <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-blue-400 text-blue-800 rounded-md border border-blue-300 text-sm font-medium animate-pulse">
            {/* Spinner */}
            <svg
              className="w-4 h-4 text-blue-800 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Calculating trip...</span>
          </div>
        )}
        {fareDetails && (
          <div className="mt-4 bg-gray-50 text-black p-4 rounded border">
            <h3 className="font-semibold mb-2">Trip summary</h3>
            <p>
              <strong>Destination:</strong>{" "}
              {fareDetails?.hospital?.address ||
                fareDetails?.destination?.address}
            </p>
            <p>
              <strong>Distance:</strong> {fareDetails?.distance} km
            </p>
            <p>
              <strong>Duration:</strong> {fareDetails?.duration} min
            </p>
            <p>
              <strong>Fare:</strong> R{fareDetails?.fare}
            </p>
          </div>
        )}

        {/* Request Ambulance */}
        <div className="mt-4">
          <button
            title="Request ambulance now"
            onClick={() => setShowPay(true)}
            disabled={!routeReady}
            className={`w-full ${routeReady
              ? "bg-red-600 hover:bg-red-700 active:translate-y-1 active:shadow-[0_2px_#666] transform transition-all duration-200 ease-in-out cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
              } text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] `}
          >
            Request Ambulance
          </button>
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full max-w-6xl h-[480px] rounded-lg shadow-lg overflow-hidden"
      />

      {/* Payment panel */}
      {showPay && (
        <div
          ref={paySectionRef}
          className="w-full max-w-lg bg-white p-4 rounded-lg shadow mt-6"
        >
          <PayAmbulance
            fare={fareDetails?.fare}
            distance={fareDetails?.distance}
            duration={fareDetails?.duration}
            pickupLocation={fareDetails?.origin}
            hospital={fareDetails?.destination}
            userDoc={userDoc}
          />
        </div>
      )}
    </div>
  );
}
