"use client";

import { useState } from "react";

/**
 * ToggleButton Component (Nurse version)
 *
 * A custom toggle switch that manages its own availability state.
 * Displays "Available" or "Unavailable" above the switch, and shows a loading spinner on toggle.
 */
const ToggleButton = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [fetching, setFetching] = useState(false);

    const handleChange = () => {
        if (fetching) return;

        setFetching(true);
        setTimeout(() => {
            setIsAvailable((prev) => !prev);
            setFetching(false);
        }, 500); // Simulate async operation
    };

    return (
        <div className="flex flex-col items-center gap-1 relative">
            {/* Status Label */}
            <span className="mb-1 text-sm text-[#a0cfff] select-none">
                {isAvailable ? "Available" : "Unavailable"}
            </span>

            {/* Toggle Switch */}
            <label className="inline-flex items-center cursor-pointer select-none relative">
                <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled={fetching}
                />

                <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-500 peer-checked:bg-blue-400 dark:peer-checked:bg-blue-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#03045e] after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:border-white" />

                {/* Spinner while toggling */}
                {fetching && (
                    <div className="absolute left-0 top-0 w-11 h-6 flex items-center justify-center bg-white/60 rounded-full z-10">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </label>
        </div>
    );
};

export default ToggleButton;
