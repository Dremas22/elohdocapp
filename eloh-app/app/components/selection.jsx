"use client";

import React from "react";

const ChooseDesignation = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 mt-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 mb-6 text-center">
                Select Your Designation
            </h2>
            <div className="grid gap-4 w-full max-w-md">
                {["I AM PATIENT", "I AM DOCTOR", "I AM NURSE"].map((role, index) => (
                    <button
                        key={index}
                        className="w-full py-3 px-6 bg-blue-600 text-white font-medium text-lg rounded-xl shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {role}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChooseDesignation;
