export const createCustomerMarker = (
  location,
  map,
  label = "🧍",
  title = "Patient"
) => {
  if (!window.google || !window.google.maps) return null;

  return new window.google.maps.Marker({
    position: location,
    map: map,
    title,
    label: {
      text: label,
      fontSize: "40px",
      fontWeight: "bold",
    },
  });
};
