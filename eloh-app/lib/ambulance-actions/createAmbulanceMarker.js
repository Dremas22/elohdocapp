export const createAmbulanceMarker = (
  location,
  map,
  label = "🚑",
  title = "Ambulance Driver"
) => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps not loaded yet.");
    return null;
  }

  return new window.google.maps.Marker({
    position: location,
    map: map,
    title,
    label: {
      text: label,
      fontSize: "20px", // Optional: increase text label size
      fontWeight: "bold",
    },
  });
};
