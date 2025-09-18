/**
 * Creates a route between the driver and the customer on the map, with markers and hover tooltips.
 *
 * @param {{ lat: number, lng: number }} driverLocation - Driver's current location.
 * @param {{ lat: number, lng: number }} customerLocation - Customer pickup location.
 * @param {{ lat: number, lng: number }} destinationLocation - Destination location.
 * @param {google.maps.Map} map - The Google Map instance.
 * @param {Function} [setDirectionsRenderer] - Optional state setter for the DirectionsRenderer.
 */
export function createRouteCustomerToDriver(
  driverLocation,
  customerLocation,
  destinationLocation,
  map,
  setDirectionsRenderer
) {
  if (!driverLocation || !customerLocation || !destinationLocation || !map)
    return;

  // Clear previous directions
  if (window.directionsRendererDriver) {
    window.directionsRendererDriver.setMap(null);
    window.directionsRendererDriver = null;
  }
  if (window.directionsRendererCustomer) {
    window.directionsRendererCustomer.setMap(null);
    window.directionsRendererCustomer = null;
  }

  // Clear previous markers
  if (window.driverMarker) window.driverMarker.setMap(null);
  if (window.customerMarker) window.customerMarker.setMap(null);
  if (window.destinationMarker) window.destinationMarker.setMap(null);

  // Helper: create hover tooltip using OverlayView
  const createTooltip = (marker, text, map) => {
    const Tooltip = class extends google.maps.OverlayView {
      constructor(position, content) {
        super();
        this.position = position;
        this.content = content;
      }
      onAdd() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.background = "#1e293b"; // dark-blue
        this.div.style.color = "#fff";
        this.div.style.padding = "6px 12px";
        this.div.style.borderRadius = "6px";
        this.div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        this.div.style.whiteSpace = "nowrap";
        this.div.style.fontSize = "14px";
        this.div.style.fontWeight = "500";
        this.div.style.pointerEvents = "none"; // ignore mouse
        this.div.innerText = this.content;
        this.div.style.opacity = "0";
        this.div.style.transition = "opacity 0.2s";
        const panes = this.getPanes();
        panes.floatPane.appendChild(this.div);
      }
      draw() {
        const overlayProjection = this.getProjection();
        const pos = overlayProjection.fromLatLngToDivPixel(
          new google.maps.LatLng(this.position.lat, this.position.lng)
        );
        if (pos) {
          this.div.style.left = pos.x + "px";
          this.div.style.top = pos.y - 35 + "px"; // above marker
        }
      }
      onRemove() {
        if (this.div) this.div.parentNode.removeChild(this.div);
      }
      show() {
        this.div.style.opacity = "1";
      }
      hide() {
        this.div.style.opacity = "0";
      }
    };

    const tooltip = new Tooltip(marker.getPosition().toJSON(), text);
    tooltip.setMap(map);

    marker.addListener("mouseover", () => tooltip.show());
    marker.addListener("mouseout", () => tooltip.hide());
  };

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

  // Destination marker
  const destinationMarker = new google.maps.Marker({
    position: destinationLocation,
    map,
    title: "Destination",
    label: { text: "🏥", fontSize: "18px" },
  });
  window.destinationMarker = destinationMarker;

  // Attach hover tooltips
  createTooltip(driverMarker, "Ambulance location 🚑", map);
  createTooltip(customerMarker, "Your location 🧍", map);
  createTooltip(destinationMarker, "Hospital / Destination 🏥", map);

  // Directions
  const directionsService = new window.google.maps.DirectionsService();
  const renderer = new window.google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#0ea5e9", // light-blue route
      strokeOpacity: 0.6,
      strokeWeight: 6,
    },
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

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(driverLocation);
        bounds.extend(customerLocation);
        bounds.extend(destinationLocation);
        // After fitting bounds
        map.fitBounds(bounds);

        // Slightly zoom out to give more view around markers
        window.google.maps.event.addListenerOnce(map, "idle", () => {
          const currentZoom = map.getZoom();
          // Reduce zoom by 1-2 levels for extra space
          const newZoom = currentZoom > 12 ? currentZoom - 2 : currentZoom;
          map.setZoom(newZoom);
        });
      } else {
        console.error("Failed to create driver-customer route:", status);
      }
    }
  );
}
