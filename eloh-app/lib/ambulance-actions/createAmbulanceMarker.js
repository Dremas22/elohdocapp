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
    label: {
      text: label,
      fontSize: "20px",
      fontWeight: "bold",
    },
  });
};
