/**
 * Creates a Google Maps marker for an ambulance with optional label, title, and jitter to avoid overlap.
 *
 * @param {Object} location - The location for the marker.
 * @param {number} location.lat - Latitude of the marker.
 * @param {number} location.lng - Longitude of the marker.
 * @param {google.maps.Map} map - The Google Maps instance where the marker will be added.
 * @param {string} [label="🚑"] - Emoji or text to display as the marker icon.
 * @param {string} [title="Ambulance Driver"] - Title shown on hover over the marker.
 * @param {number} [index=0] - Index used to slightly offset the marker if multiple markers are at the same location.
 * @returns {google.maps.Marker|null} The created Google Maps marker, or null if Google Maps is not loaded.
 *
 * @example
 * const marker = createAmbulanceMarker({ lat: -25.7479, lng: 28.2293 }, mapInstance);
 *
 * // Multiple markers with slight jitter
 * const marker2 = createAmbulanceMarker({ lat: -25.7479, lng: 28.2293 }, mapInstance, "🚑", "Driver 2", 1);
 */
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
