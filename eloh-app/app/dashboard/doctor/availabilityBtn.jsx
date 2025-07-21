"use client";

import React from "react";

const ToggleButton = ({ checked, onChange }) => {
    return (
        <label className="inline-flex items-center cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div
                className="
          w-11 h-6 bg-gray-200 rounded-full relative 
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
          dark:peer-focus:ring-blue-800
          dark:bg-gray-700
          peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600
          peer-checked:after:translate-x-full
          rtl:peer-checked:after:-translate-x-full
          after:content-['']
          after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:border after:border-gray-300
          after:rounded-full after:h-5 after:w-5 after:transition-all
          dark:border-gray-600 peer-checked:after:border-white
        "
            />
        </label>
    );
};

export default ToggleButton;
