/**
 * Creates a route between the driver and the customer on the map, with markers.
 *
 * @param {{ lat: number, lng: number }} driverLocation - Driver's current location.
 * @param {{ lat: number, lng: number }} customerLocation - Customer pickup location.
 * @param {google.maps.Map} map - The Google Map instance.
 * @param {Function} [setDirectionsRenderer] - Optional state setter for the DirectionsRenderer.
 */
export function createRouteCustomerToDriver(
  driverLocation,
  customerLocation,
  map,
  setDirectionsRenderer
) {
  if (!driverLocation || !customerLocation || !map) return;

  // Clear previous route
  if (window.directionsRenderer) {
    window.directionsRenderer.setMap(null);
    window.directionsRenderer = null;
  }

  // Clear previous markers
  if (window.driverMarker) {
    window.driverMarker.setMap(null);
    window.driverMarker = null;
  }
  if (window.customerMarker) {
    window.customerMarker.setMap(null);
    window.customerMarker = null;
  }

  // Add driver marker
  const driverMarker = new window.google.maps.Marker({
    position: driverLocation,
    map,
    title: "Driver",
    label: { text: "🚑", fontSize: "18px" },
  });
  window.driverMarker = driverMarker;

  // Add customer marker
  const customerMarker = new window.google.maps.Marker({
    position: customerLocation,
    map,
    title: "You",
    label: { text: "🧍", fontSize: "18px" },
  });
  window.customerMarker = customerMarker;

  const directionsService = new window.google.maps.DirectionsService();
  const renderer = new window.google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });
  renderer.setMap(map);
  window.directionsRenderer = renderer;
  if (setDirectionsRenderer) setDirectionsRenderer(renderer);

  directionsService.route(
    {
      origin: driverLocation,
      destination: customerLocation,
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        renderer.setDirections(result);
        // Optional: zoom to fit route
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(driverLocation);
        bounds.extend(customerLocation);
        map.fitBounds(bounds);
      } else {
        console.error("Failed to create driver-customer route:", status);
      }
    }
  );
}
