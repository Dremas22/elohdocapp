"use client";

/**
 * DoctorToggleButton Component
 *
 * Displays and toggles the doctor's availability status.
 * Fetches current status on mount and handles API updates with a loading state.
 */
import { useState, useEffect } from "react";

const DoctorToggleButton = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true); // Start loading
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`
        );
        const data = await res.json();
        if (res.ok) setIsAvailable(data.available || false);
        else console.error("Failed to fetch availability:", data.error);
      } catch (err) {
        // Log any error during fetch
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Toggle availability handler
  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) setIsAvailable(data.available);
      else console.error("Toggle error:", data.error);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setLoading(false); // hides spinner
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Availability label */}
      <span className="text-sm text-gray-300 select-none">
        {isAvailable ? "Available" : "Unavailable"}
      </span>

      {/* Toggle switch */}
      <label
        title="Set availability"
        className="inline-flex items-center cursor-pointer select-none relative"
      >
        {/* Hidden checkbox for state control */}
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={handleToggle}
          className="sr-only peer"
          disabled={loading}
        />

        {/* Visual toggle track */}
        <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-500 peer-checked:bg-blue-400 dark:peer-checked:bg-blue-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#03045e] after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:border-white"
        />

        {/* Loading spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full z-10">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </label>
    </div>
  );
};

export default DoctorToggleButton;
