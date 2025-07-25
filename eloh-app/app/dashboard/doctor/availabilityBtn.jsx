"use client";

import React from "react";

/**
 * ToggleButton Component
 * 
 * A custom toggle switch (styled checkbox) component.
 * - Accepts `checked` (boolean) to control the switch state.
 * - Accepts `onChange` (function) to handle state changes.
 */
const ToggleButton = ({ checked, onChange }) => {
    return (
        <label className="inline-flex items-center cursor-pointer select-none">
            {/* Visually hidden checkbox input */}
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer" // `sr-only` hides the element visually but keeps it accessible
            />

            {/* Custom toggle UI element */}
            <div
                className="
                    w-11 h-6 bg-gray-200 rounded-full relative 
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                    dark:peer-focus:ring-blue-800
                    dark:bg-gray-500

                    // Background color when checked
                    peer-checked:bg-blue-400 dark:peer-checked:bg-blue-400

                    // Move the toggle circle when checked
                    peer-checked:after:translate-x-full
                    rtl:peer-checked:after:-translate-x-full

                    // Toggle circle styles
                    after:content-['']
                    after:absolute after:top-[2px] after:left-[2px]
                    after:bg-[#03045e] after:border after:border-gray-300
                    after:rounded-full after:h-5 after:w-5 after:transition-all

                    // Dark mode border styling
                    dark:border-gray-600 peer-checked:after:border-white
                "
            />
        </label>
    );
};

export default ToggleButton;
