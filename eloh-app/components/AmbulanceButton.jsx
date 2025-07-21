"use client";

import { useState } from "react";
import { FaAmbulance } from "react-icons/fa";

const AmbulanceButton = () => {
    const [showAlert, setShowAlert] = useState(false);

    const handleClick = () => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000); // alert automatically disappears after 3s
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {showAlert && (
                <div className="mt-2 p-2 bg-white text-red-600 rounded shadow-lg text-sm font-semibold">
                    Emergency Response Requested!
                </div>
            )}

            <button
                onClick={handleClick}
                className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg scale-115 cursor-pointer animate-pulse"
                title="Request Ambulance"
            >
                <FaAmbulance className="text-2xl" />
            </button>

        </div>
    );
};

export default AmbulanceButton;
