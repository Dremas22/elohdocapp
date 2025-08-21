export const createAmbulanceMarker = (
  location,
  map,
  label = "🚑",
  title = "Ambulance Driver",
  index = 0
) => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps not loaded yet.");
    return null;
  }

  // Apply tiny jitter offset if multiple markers are at the same location
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
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
          <text y="32" font-size="30">🚑</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40),
    },
  });
};
