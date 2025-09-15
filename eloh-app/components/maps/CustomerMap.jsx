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
import FareDetails from "./FareDetails";
import CalculatingTrip from "./CalculatingTrip";
import { getLatestTripWithDriver } from "@/lib/getDriverById";
import { createRouteCustomerToDriver } from "@/lib/createRouteCustomerToDriver";

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
  const [acceptedDriver, setAcceptedDriver] = useState(null);

  useEffect(() => {
    if (showPay && paySectionRef.current) {
      paySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showPay]);

  // --- confirm payment on return ---
  useEffect(() => {
    const confirmPay = async () => {
      if (!currentUser || !sessionId || type !== "ambulance_request") return;
      if (!sessionId.startsWith("cs_")) return;

      let tripData = fareDetails;

      if (!tripData) {
        const stored = localStorage.getItem("fareDetails");
        if (stored) {
          tripData = JSON.parse(stored);
          setFareDetails(tripData);
        } else {
          console.warn("No fareDetails found for confirming payment");
          return;
        }
      }

      tripData = {
        ...tripData,
        customerId: currentUser?.uid || userDoc?.userId,
        customerEmail:
          currentUser?.email || userDoc?.email || "unknown@email.com",
        destination:
          destinationPlace || tripData?.hospital || tripData?.destination,
        type: "ambulance_request",
        pickupLocation: pickupPlace,
        sessionId,
        addRating: false,
      };

      await new Promise((resolve) => setTimeout(resolve, 100));

      const driver = await confirmPayment(
        sessionId,
        tripData,
        tripData.customerId
      );

      setAcceptedDriver(driver);

      if (driver) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        localStorage.removeItem("fareDetails");
      }
    };

    confirmPay();
  }, [currentUser, sessionId, type, fareDetails]);

  // --- initialize map + autocomplete ---
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google maps not loaded");
      return;
    }

    // Try geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          setCurrentLocation(loc);
          setPickupPlace(loc);

          const gMap = new window.google.maps.Map(mapRef.current, {
            center: loc,
            zoom: 13,
            mapTypeId: "roadmap",
          });

          setMap(gMap);
          createCustomerMarker(loc, gMap, "🧍", "Customer (You)");
        },
        (err) => {
          console.error("Geolocation error:", err.message);
          const fallback = { lat: -26.2041, lng: 28.0473 }; // Joburg fallback
          setCurrentLocation(fallback);
          setPickupPlace(fallback);

          const gMap = new window.google.maps.Map(mapRef.current, {
            center: fallback,
            zoom: 12,
            mapTypeId: "roadmap",
          });
          setMap(gMap);
        }
      );
    }
  }, []);

  // Track ambulances when map/location ready
  useEffect(() => {
    if (!map) return;
    if (!pickupPlace && !destinationPlace && !currentLocation) return;

    const location = destinationPlace || pickupPlace || currentLocation;
    trackAmbulances(location, map, 450);
  }, [map, currentLocation, pickupPlace, destinationPlace]);

  const handleCreateRoute = () => {
    if (!pickupPlace && !currentLocation)
      return toastError("Pickup location missing");
    if (!destinationPlace) return toastError("Destination missing");

    setCalculatingTrip(true);
    createRoute(pickupPlace || currentLocation, destinationPlace, map);
  };

  // --- cancel route ---
  const handleCancelRoute = async () => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
    setFareDetails(null);
    setRouteReady(false);
    setDestinationPlace(null);
    if (destInputRef.current) destInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center w-full justify-center min-h-screen bg-gray-100 pt-20 lg:pl-66 p-4">
      {/* Sidebar */}
      <CustomerSidebarMenu userDoc={userDoc} />

      {/* Ambulance request panel */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          🚑 Request Ambulance
        </h2>

        {/* Pickup */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative w-full">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              ref={pickupInputRef}
              type="text"
              placeholder="Enter pickup address or use current location"
              className="flex-1 p-3 pl-10 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                  const loc = { lat: coords.latitude, lng: coords.longitude };
                  setPickupPlace(loc);
                  if (map) map.panTo(loc);
                });
              }
            }}
            className="bg-[#03045e] text-white font-semibold py-2 px-8 rounded-xl shadow active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-2"
          >
            <FaLocationDot className="h-4 w-5" />
            <span>Use Current Location</span>
          </button>
        </div>

        {/* Destination */}
        <div className="relative mb-4">
          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={destInputRef}
            type="text"
            placeholder="Type destination (clinic, hospital, address or any place)..."
            className="pl-10 p-3 border border-gray-300 text-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-row gap-3 flex-wrap">
          <button
            onClick={handleCreateRoute}
            disabled={locationLoading}
            className={`flex-1 min-w-[120px] ${locationLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#03045e] hover:bg-[#023e8a]"
              } text-white font-semibold py-2.5 px-3 rounded-xl shadow transition-all`}
          >
            Create Route
          </button>

          <button
            onClick={handleCancelRoute}
            className="flex-1 min-w-[120px] bg-[#03045e] text-white font-semibold py-2.5 px-3 rounded-xl shadow hover:bg-[#023e8a] transition-all cursor-pointer"
          >
            Cancel Route
          </button>
        </div>

        {/* Trip summary */}
        {calculatingTrip && <CalculatingTrip />}
        {fareDetails && <FareDetails fareDetails={fareDetails} />}

        {/* Request Ambulance */}
        {fareDetails && (
          <div className="mt-4">
            <button
              onClick={() => setShowPay(true)}
              disabled={!routeReady}
              className={`w-full ${routeReady
                ? "bg-red-600 hover:bg-red-700 active:translate-y-1"
                : "bg-gray-300 cursor-not-allowed"
                } text-white font-semibold py-3 px-8 rounded-xl shadow`}
            >
              Request Ambulance
            </button>
          </div>
        )}
      </div>

      {/* Map (always visible) */}
      <div
        ref={mapRef}
        className="w-full max-w-6xl h-[480px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg shadow-lg overflow-hidden mx-auto"
      />

      {/* Payment panel */}
      {showPay && (
        <div
          ref={paySectionRef}
          className="w-full max-w-lg bg-white p-4 rounded-lg shadow mt-4"
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
