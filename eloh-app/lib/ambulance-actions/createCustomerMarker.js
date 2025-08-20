export const createCustomerMarker = (
  location,
  map,
  label = "🧍",
  title = "Patient",
  index = 0
) => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps not loaded yet.");
    return null;
  }

  // Small jitter offset in case multiple patients are at the same spot
  const jitter = 0.00005 * index; // ~5 meters
  const jitteredLocation = {
    lat: location.lat + jitter,
    lng: location.lng + jitter,
  };

  return new window.google.maps.Marker({
    position: jitteredLocation,
    map,
    title,
    icon: {
      url: `data:image/svg+xml;utf8,
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
          <text y="32" font-size="32">${label}</text>
        </svg>`,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
    },
  });
};
