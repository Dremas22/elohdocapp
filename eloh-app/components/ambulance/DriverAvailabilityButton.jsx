"use client";

import { useState } from "react";

/**
 * DriverAvailabilityButton
 *
 * Custom toggle for ambulance drivers indicating "On Duty" or "Off Duty".
 * Shows a loading spinner while toggling.
 * Includes a tooltip for clarity.
 */

const DriverAvailabilityButton = ({ isAvailable, fetching, onChange }) => {
    return (
        <div className="flex flex-col items-center gap-1 mb-3 lg:mt-5 sm:mb-2 sm:-mt-2 md:-mt-2.5 relative">
            {/* Status Label */}
            <span className="mb-1 text-sm text-blue-500 select-none">
                {isAvailable ? "On Duty" : "Off Duty"}
            </span>

            {/* Tooltip Wrapper */}
            <div className="relative group">
                {/* Toggle Switch */}
                <label className="inline-flex items-center cursor-pointer select-none relative">
                    <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={async () => await onChange()}
                        className="sr-only peer"
                        disabled={fetching}
                    />

                    <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#03045e] after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white" />

                    {/* Spinner while toggling */}
                    {fetching && (
                        <div className="absolute left-0 top-0 w-11 h-6 flex items-center justify-center bg-white/60 rounded-full z-10">
                            <div className="w-3 h-3 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </label>

                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-white text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
                    Set driver on-duty status
                </div>
            </div>
        </div>
    );
};

export default DriverAvailabilityButton;
