"use client";

import {
  deleteCustomerRoute,
  getAddressFromLatLng,
  saveCustomerRoute,
  trackAmbulances,
} from "@/helpers";
import { toastError, toastInfo } from "@/helpers/toastHelper";
import { createCustomerMarker } from "@/lib/ambulance-actions/createCustomerMarker";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import PayAmbulance from "../ambulance/PayAmbulance";
import { auth } from "@/db/client";

export default function CustomerMap() {
  const mapRef = useRef(null);
  const pickupInputRef = useRef(null);
  const destInputRef = useRef(null);

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

  const RATE_PER_KM = 10; // change to your rate

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
          createCustomerMarker(loc, gMap, "🧍", "Customer");

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

  const handleCreateRoute = () => {
    if (!pickupPlace && !currentLocation)
      return toastError("Pickup location missing");
    if (!destinationPlace) return toastError("Destination missing");

    createRoute(pickupPlace || currentLocation, destinationPlace, map);
  };

  // createRoute function - draws route, calculates distance/duration/fare, saves to firestore
  function createRoute(origin, destination, gMap = map) {
    setLocationLoading(true);
    if (!gMap) {
      console.error("Map not ready");
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
              fare: fare,
            };

            // Save route to Firestore
            try {
              const user = auth.currentUser;
              if (!user) throw new Error("User not authenticated");
              await saveCustomerRoute(user?.uid, routeData);
              // set UI
              setFareDetails(routeData);
              setRouteReady(true);
            } catch (saveErr) {
              console.error("Failed to save route:", saveErr.message);
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
        }
      );
    } catch (err) {
      console.error("createRoute error:", err.message);
    } finally {
      setLocationLoading(false);
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
      const user = auth.currentUser;

      if (!user) throw new Error("User not authenticated");

      const routesRef = collection(db, "customers", user?.uid, "routes");
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
    <div className="flex flex-col items-center w-full justify-center min-h-screen bg-gray-100 lg:pt-80 pt-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          🚑 Request Ambulance
        </h2>

        {/* Pickup */}
        <label className="block text-lg sm:text-xl font-medium text-black mb-2">
          Pickup location
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            ref={pickupInputRef}
            type="text"
            placeholder="Enter pickup address or use current location"
            className="flex-1 p-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button
            onClick={useMyLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full sm:w-auto"
          >
            📍 Use my location
          </button>
        </div>

        {/* Destination */}
        <label className="block text-lg sm:text-xl font-medium text-black mb-2">
          Destination
        </label>
        <input
          ref={destInputRef}
          type="text"
          placeholder="Type destination (clinic, hospital, address or any place)..."
          className="mb-4 p-3 border border-gray-300 text-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreateRoute}
            disabled={locationLoading}
            className={`flex-1 ${locationLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold py-2 px-4 rounded-lg w-full`}
          >
            {locationLoading ? "Loading..." : "Create Route"}
          </button>

          <button
            onClick={handleCancelRoute}
            className="flex-1 bg-[#fb5607] hover:bg-[#f48c06] text-white font-semibold py-2 px-4 rounded-lg w-full"
          >
            Cancel Route
          </button>

          <button
            onClick={() =>
              trackAmbulances(
                destinationPlace || pickupPlace || currentLocation,
                map
              )
            }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
          >
            Track Ambulances (30km)
          </button>
        </div>

        {/* Trip summary (distance/fare) */}
        {fareDetails && (
          <div className="mt-4 bg-gray-50 text-black p-4 rounded border">
            <h3 className="font-semibold mb-2">Trip summary</h3>
            <p>
              <strong>Destination:</strong>{" "}
              {fareDetails.destination.address || fareDetails.destination.name}
            </p>
            <p>
              <strong>Distance:</strong> {fareDetails.distance} km
            </p>
            <p>
              <strong>Duration:</strong> {fareDetails.duration} min
            </p>
            <p>
              <strong>Fare:</strong> R{fareDetails.fare}
            </p>
          </div>
        )}

        {/* Request Ambulance */}
        <div className="mt-4">
          <button
            onClick={() => setShowPay(true)}
            disabled={!routeReady}
            className={`w-full ${routeReady
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-300 cursor-not-allowed"
              } text-white py-2 px-4 rounded-lg font-semibold`}
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
        <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow mt-6">
          <PayAmbulance
            fare={fareDetails?.fare}
            distance={fareDetails?.distance}
            duration={fareDetails?.duration}
            pickupLocation={fareDetails?.origin}
            hospital={fareDetails?.destination}
          />
        </div>
      )}
    </div>
  );
}
