"use client";

import {
  deleteCustomerRoute,
  getAddressFromLatLng,
  saveCustomerTrip,
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
import PayAmbulance from "../ambulance/PayAmbulance";
import CustomerSidebarMenu from "@/app/dashboard/customer/CustomerSidebar";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter, useSearchParams } from "next/navigation";
import { getLatestTripWithDriver } from "@/lib/getDriverById";
import { createRouteCustomerToDriver } from "@/lib/createRouteCustomerToDriver";
import { normalizeLatLng } from "@/lib/normalizeLatLng";
import PaymentConfirmationLoader from "../ambulance/customers/PaymentConfirmationLoader";
import RequestSection from "./RequestSection";
import confirmPayment from "@/lib/confirmPayment";
import ArrivalCodeModal from "./ArrivalCodeModal";

const RATE_PER_KM = 10;

export default function CustomerMap({ userDoc }) {
  const mapRef = useRef(null);
  const pickupInputRef = useRef(null);
  const destInputRef = useRef(null);
  const paySectionRef = useRef(null);
  const lastTripRef = useRef(null);
  const tripCompletedRef = useRef(false);

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
  const [destMarker, setDestMarker] = useState(null);
  const [fareDetails, setFareDetails] = useState(null);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const router = useRouter();

  // Scroll to payment section
  useEffect(() => {
    if (showPay && paySectionRef.current) {
      paySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showPay]);

  // Confirm payment if session_id exists
  useEffect(() => {
    const confirmPay = async () => {
      if (!currentUser || !sessionId || type !== "ambulance_request") return;
      if (!sessionId.startsWith("cs_")) return;
      if (!fareDetails) return;

      try {
        setConfirmingPayment(true); // ✅ start loading
        const tripData = {
          ...fareDetails,
          customerId: currentUser?.uid || userDoc?.userId,
          customerEmail:
            currentUser?.email || userDoc?.email || "unknown@email.com",
          sessionId,
          destination: destinationPlace || fareDetails.destination,
          pickupLocation: pickupPlace || fareDetails.pickupLocation,
          type: "ambulance_request",
        };

        const driver = await confirmPayment(
          sessionId,
          tripData,
          tripData.customerId
        );

        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        window.location.reload();
      } catch (error) {
        toastError("Payment confirmation failed. Please try again.");
      } finally {
        setConfirmingPayment(false);
      }
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
              console.log("Pickup place has no geometry");
              return;
            }
            const p = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name,
              name: place.name || null,
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

  // Firestore listener → trip always overrides state
  useEffect(() => {
    if (!currentUser?.uid || !map) return;

    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("customerId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const trip = snapshot.docs[0].data();
      // Only handle trip completion once
      if (
        trip.arrivalCode === null &&
        trip.status === "completed" &&
        !tripCompletedRef.current
      ) {
        tripCompletedRef.current = true; // ✅ mark as handled

        // Refresh the page once
        router.refresh();

        // Optional: clear state (in case you don't reload)
        setFareDetails(null);
        setRouteReady(false);
        setDestinationPlace(null);
        if (destInputRef.current) destInputRef.current.value = "";
      }

      // If trip already paid → set once, only draw route (skip state updates later)
      if (trip.isPaid) {
        setFareDetails(trip);
        setRouteReady(true);

        if (
          trip.pickupLocation &&
          trip.hospital &&
          trip.status !== "completed"
        ) {
          createRoute(trip.pickupLocation, trip.hospital, map, {
            skipState: true,
            skipSave: true,
          });
        }
        return;
      }

      // Not paid → normal update
      const stableTrip = {
        customerId: trip.customerId,
        isPaid: trip.isPaid || false,
        fare: trip.fare,
      };

      if (JSON.stringify(stableTrip) !== JSON.stringify(lastTripRef.current)) {
        lastTripRef.current = stableTrip;
        setFareDetails(trip);
        setRouteReady(true);

        if (
          trip.pickupLocation &&
          trip.hospital &&
          trip.status !== "completed"
        ) {
          createRoute(trip.pickupLocation, trip.hospital, map, {
            skipSave: true,
          });
        }
      }
    });
    return () => unsubscribe();
  }, [currentUser?.uid, map]);

  // Track ambulances
  useEffect(() => {
    if (!map) return;
    const location = destinationPlace || pickupPlace || currentLocation;
    if (location) trackAmbulances(location, map, 450);
  }, [map, currentLocation, pickupPlace, destinationPlace]);

  // Route from driver to customer
  useEffect(() => {
    if (!currentUser?.uid || !map) return;

    const fetchAndRoute = async () => {
      const { trip, driver } = await getLatestTripWithDriver(currentUser.uid);
      if (!trip || !driver || trip.status === "completed") return;

      // Clear previous driver → customer route
      if (window.driverRouteRenderer) {
        window.driverRouteRenderer.setMap(null);
        window.driverRouteRenderer = null;
      }

      /**
       *  TODO: Example object used only for testing when the customer and driver
        are located very close to each other. This artificially offsets the
        customer's coordinates (~200m north-east) so that the route line is
        easier to visualize on the map. Remove or disable in production and use (trip.pickupLocation) .
       */
      // const testCustomerLoc = {
      //   lat: trip.pickupLocation.lat + 0.002, // ~200m north
      //   lng: trip.pickupLocation.lng + 0.002, // ~200m east
      // };

      // Draw driver → customer route (normal opacity)
      window.driverRouteRenderer = createRouteCustomerToDriver(
        driver.location,
        trip.pickupLocation,
        trip.hospital,
        map,
        setDirectionsRenderer
      );

      // Draw customer → hospital route (faded)
      if (trip.hospital) {
        if (window.customerRouteRenderer) {
          window.customerRouteRenderer.setMap(null);
          window.customerRouteRenderer = null;
        }

        window.customerRouteRenderer = await createRoute(
          trip.pickupLocation,
          trip.hospital,
          map,
          {
            skipState: true,
            polylineOptions: { strokeColor: "#0000FF", strokeOpacity: 0.3 },
            skipSave: true,
          }
        );
      }
    };

    fetchAndRoute();
  }, [currentUser?.uid, map]);

  // Create route handler
  const handleCreateRoute = async () => {
    if (!pickupPlace && !currentLocation)
      return toastError("Pickup location missing");
    if (!destinationPlace) return toastError("Destination missing");

    setCalculatingTrip(true);

    // Wait for createRoute to finish before enabling Request Ambulance
    await createRoute(pickupPlace || currentLocation, destinationPlace, map);

    setCalculatingTrip(false);
    setRouteReady(true);
  };

  // Draw route + save to Firestore
  async function createRoute(origin, destination, gMap = map, options = {}) {
    const {
      skipState = false,
      polylineOptions = {},
      skipSave = false,
    } = options;
    if (!gMap) return;

    try {
      const renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: polylineOptions.strokeColor || "#0000FF",
          strokeOpacity: polylineOptions.strokeOpacity || 1.0,
          strokeWeight: polylineOptions.strokeWeight || 6,
        },
      });

      renderer.setMap(gMap);

      const directionsService = new window.google.maps.DirectionsService();
      const normOrigin = normalizeLatLng(origin);
      const normDestination = normalizeLatLng(destination);

      return new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: normOrigin,
            destination: normDestination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          async (result, status) => {
            if (status === "OK") {
              renderer.setDirections(result);

              // Fit map bounds
              const bounds = new window.google.maps.LatLngBounds();
              result.routes[0].overview_path.forEach((point) =>
                bounds.extend(point)
              );
              gMap.fitBounds(bounds);
              window.google.maps.event.addListenerOnce(gMap, "idle", () => {
                const currentZoom = gMap.getZoom();
                // Reduce zoom by 1-2 levels for extra space
                const newZoom =
                  currentZoom > 12 ? currentZoom - 2 : currentZoom;
                gMap.setZoom(newZoom);
              });

              const leg = result.routes[0].legs[0];
              const distanceKm = (leg.distance?.value ?? 0) / 1000;
              const fare = (distanceKm * RATE_PER_KM).toFixed(2);

              const normOrigin = normalizeLatLng(origin);
              const normDestination = normalizeLatLng(destination);

              const originAddress = await getAddressFromLatLng(
                normOrigin.lat,
                normOrigin.lng
              );
              const destinationAddress = await getAddressFromLatLng(
                normDestination.lat,
                normDestination.lng
              );

              const newFareDetails = {
                origin: {
                  ...normOrigin,
                  address: originAddress,
                },
                destination: {
                  ...normDestination,
                  name: destination?.name || null,
                  address: destinationAddress,
                },
                distance: distanceKm.toFixed(2),
                duration: leg.duration?.text || "",
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
                fare,
                customerId: currentUser?.uid,
                createdAt: new Date(),
                sessionId,
                status: "pending",
              };

              if (!skipState) setFareDetails(newFareDetails);

              // Save to Firestore
              if (!skipSave && currentUser?.uid) {
                try {
                  await saveCustomerTrip(currentUser.uid, newFareDetails);
                } catch (err) {
                  console.error("Failed to save trip:", err);
                }
              }

              resolve(renderer);
            } else {
              console.error("Failed to create route:", status);
              reject(status);
            }
          }
        );
      });
    } catch (err) {
      console.error("createRoute error:", err);
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
        toastError("Unable to get your location.");
      }
    );
  };

  // Cancel route
  const handleCancelRoute = async () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    setDirectionsRenderer(null);
    setFareDetails(null);
    setRouteReady(false);
    setDestinationPlace(null);
    if (destInputRef.current) destInputRef.current.value = "";

    try {
      if (!currentUser) throw new Error("User not authenticated");
      const tripsRef = collection(db, "trips");
      const q = query(
        tripsRef,
        where("customerId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const routeDoc = snapshot.docs[0];
        await deleteCustomerRoute(currentUser.uid, routeDoc.id);
        toastInfo("Route cancelled and removed from database.");
      }
    } catch (err) {
      console.error("Cancel route failed:", err.message);
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center min-h-screen bg-gray-100 pt-20 lg:pl-66 p-4">
      {confirmingPayment && <PaymentConfirmationLoader />}
      <ArrivalCodeModal fareDetails={fareDetails} />

      <CustomerSidebarMenu userDoc={userDoc} />

      <RequestSection
        pickupInputRef={pickupInputRef}
        destInputRef={destInputRef}
        fareDetails={fareDetails}
        calculatingTrip={calculatingTrip}
        routeReady={routeReady}
        setShowPay={setShowPay}
        useMyLocation={useMyLocation}
        handleCreateRoute={handleCreateRoute}
        handleCancelRoute={handleCancelRoute}
      />
      {/* Map */}
      <div
        ref={mapRef}
        className="w-full max-w-6xl h-[480px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg shadow-lg overflow-hidden mx-auto"
      />

      {/* Payment Section */}
      {showPay && fareDetails && !fareDetails.isPaid && (
        <div
          ref={paySectionRef}
          className="w-full max-w-lg bg-white p-4 rounded-lg shadow mt-6"
        >
          <PayAmbulance
            fare={fareDetails.fare}
            distance={fareDetails.distance}
            duration={fareDetails.duration}
            pickupLocation={fareDetails.origin}
            hospital={fareDetails.destination}
            userDoc={userDoc}
          />
        </div>
      )}
    </div>
  );
}
