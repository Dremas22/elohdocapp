
import React from "react";

const PatientDashboardHeader = ({ doctor = 0, nurse = 0 }) => {
    return (
        <div className="w-full flex flex-col items-center px-4 pt-10 space-y-3">
            {/* Consultations Remaining Box */}
            <div className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 lg:ml-50 rounded-2xl shadow-2xl w-full max-w-xs text-center transform transition-transform duration-300 hover:shadow-[#0d6efd]/50 cursor-default">
                <h2 className="text-sm font-bold mb-2 tracking-wide text-gray-200 drop-shadow-md">
                    Consultations Remaining
                </h2>
                <div className="text-white text-sm flex flex-col sm:flex-row justify-center gap-2 sm:gap-x-6">
                    <p>
                        Doctor:{" "}
                        <span className="font-bold text-gray-300">{doctor}</span>
                    </p>
                    <p>
                        Nurse:{" "}
                        <span className="font-bold text-gray-300">{nurse}</span>
                    </p>
                </div>
            </div>

            {/* Header Text */}
            <div className="max-w-screen-xl mx-auto px-4 text-center lg:pl-50">
                <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-3xl sm:text-4xl leading-tight">
                    Virtual Medical Consultations
                </h1>
                <p className="mt-4 sm:mt-6 max-w-xl mx-auto text-gray-300 text-base sm:text-xl">
                    Connect with licensed medical professionals through secure video
                    consultations from home.
                </p>
            </div>
        </div>
    );
};

export default PatientDashboardHeader;
