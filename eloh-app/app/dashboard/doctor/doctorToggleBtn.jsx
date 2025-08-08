"use client";

/**
 * DoctorToggleButton Component
 *
 * Handles doctor availability toggle, fetching current availability status from the API,
 * toggling availability via a POST request, and showing a loading spinner while fetching.
 */
import { useState, useEffect } from "react";

const DoctorToggleButton = () => {
  // State to hold whether the doctor is currently available or not
  const [isAvailable, setIsAvailable] = useState(false);
  // State to indicate if a fetch or toggle request is in progress
  const [fetching, setFetching] = useState(true);

  // Fetch the initial availability status when the component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      setFetching(true); // Start loading
      try {
        // Call the GET availability API endpoint
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`
        );
        const data = await res.json();
        if (res.ok) {
          // Update availability state based on API response
          setIsAvailable(data.available || false);
        }
      } catch (err) {
        // Log any error during fetch
        console.error("Failed to fetch availability:", err);
      } finally {
        // Loading finished
        setFetching(false);
      }
    };

    fetchAvailability();
  }, []);

  // Function to handle toggling availability state by calling POST API
  const handleToggle = async () => {
    setFetching(true); // Start loading during toggle request
    try {
      // Call the POST toggle API endpoint to update availability status
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`,
        {
          method: "POST",
          credentials: "include", // Send cookies/auth
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Update availability based on new status returned by server
        setIsAvailable(data.available);
      } else {
        // Log error returned by API
        console.error("Error:", data.error);
      }
    } catch (err) {
      // Log any error during toggle
      console.error("Toggle failed:", err);
    } finally {
      // Loading finished
      setFetching(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Label showing current availability status */}
      <label className="text-sm text-gray-300 select-none">
        {isAvailable ? "Available" : "Unavailable"}
      </label>

      {/* Custom styled toggle switch */}
      <label
        title="Set availability" // Tooltip for accessibility
        className="inline-flex items-center cursor-pointer select-none relative"
      >
        {/* Hidden checkbox controlling toggle state */}
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={handleToggle} // Calls toggle handler on change
          className="sr-only peer disabled:cursor-not-allowed"
          disabled={fetching} // Disable toggle while loading
        />
        {/* Visual toggle switch element styled with Tailwind + peer classes */}
        <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-500 peer-checked:bg-blue-400 dark:peer-checked:bg-blue-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#03045e] after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:border-white" />

        {/* Spinner overlay while fetching */}
        {fetching && (
          <div className="absolute left-0 top-0 w-11 h-6 flex items-center justify-center bg-white/60 rounded-full z-10">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </label>
    </div>
  );
};

export default DoctorToggleButton;
