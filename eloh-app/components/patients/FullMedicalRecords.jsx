"use client";

import { FaTimes } from "react-icons/fa";
import SocialHistorySection from "./SocialHistorySection";
import ToggleMedicalSection from "./ToggleMedicalSection";

const FullMedicalRecords = ({
  medicalHistory,
  loading,
  socialHistory,
  onClose,
  doctor = true, // true if doctor, false if nurse
}) => {
  // Loading state
  if (loading)
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <p className="text-sm text-gray-500 italic px-4 py-2 bg-yellow-50 rounded-md text-center">
          Loading medical records...
        </p>
      </div>
    );

  if (!medicalHistory || !socialHistory)
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <p className="text-red-500 px-4 py-2 bg-red-50 rounded-md text-center">
          No data found for this patient.
        </p>
      </div>
    );

  const staticSections = {
    adultIllnesses: "Adult Illnesses",
    childhoodIllnesses: "Childhood Illnesses",
    hospitalizations: "Hospitalizations",
    majorInjuries: "Major Injuries",
    surgeries: "Surgeries",
  };

  return (
    <div className="fixed mt-20 inset-0 bg-black backdrop-blur-sm z-[9999] flex items-center justify-center px-2 sm:px-4">
      {/* Modal content */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col">
        {/* Close button */}
        <button
          title="Close the medical records portal"
          onClick={onClose}
          className="absolute top-1 right-1.5 text-gray-500 hover:text-gray-800 text-xl cursor-pointer z-50"
        >
          <FaTimes />
        </button>

        {/* Content wrapper */}
        <div className="flex flex-col lg:flex-row gap-4 h-full overflow-y-auto p-4 md:p-6">
          {/* Left - Dynamic Medical & Social Sections */}
          <div className="w-full lg:w-3/4 flex flex-col gap-4">
            <section className="bg-white rounded-xl shadow p-4">
              <ToggleMedicalSection medicalHistory={medicalHistory} />
            </section>

            <section className="bg-white rounded-xl shadow p-4">
              <SocialHistorySection socialHistory={socialHistory} />
            </section>
          </div>

          {/* Right - Static Sections */}
          <aside className="w-full lg:mt-6  lg:w-1/4 flex flex-col gap-4">
            {Object.entries(staticSections).map(([key, title]) => (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-base font-semibold text-[#023e8a] mb-2 border-b border-blue-100 pb-1">
                  {title}
                </h3>

                {medicalHistory?.[key]?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {medicalHistory[key].map((item, index) => (
                      <li key={index}>
                        {typeof item === "string" ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No records found.</p>
                )}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FullMedicalRecords;
