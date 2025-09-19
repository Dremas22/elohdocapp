/**
 * Normalizes a Google Maps LatLng object or a plain `{ lat, lng }` literal
 * into a consistent object with numeric `lat` and `lng` properties.
 *
 * This handles both formats:
 * - Google `LatLng` object → { lat: number, lng: number }
 *   (where `.lat()` and `.lng()` are functions)
 * - Plain object → { lat: number, lng: number }
 *
 * @param {google.maps.LatLng | { lat: number, lng: number } | null | undefined} point
 *   The point to normalize. Can be a Google `LatLng`, a plain literal, or null/undefined.
 * @returns {{ lat: number, lng: number } | null}
 *   A normalized object with numeric latitude/longitude values, or `null` if input is invalid.
 */
export function normalizeLatLng(point) {
  if (!point) return null;
  if (typeof point.lat === "function" && typeof point.lng === "function") {
    return { lat: point.lat(), lng: point.lng() };
  }
  return { lat: point.lat, lng: point.lng };
}
