"use client";

import { useState } from "react";
import NoteList from "./NoteList";

const ToggleMedicalSection = ({ medicalHistory }) => {
  const sectionTitles = {
    sickNotes: "Sick Notes",
    prescriptions: "Prescriptions",
    generalNotes: "Patient Files",
  };

  const toggleSections = Object.keys(sectionTitles);
  const [activeToggle, setActiveToggle] = useState("sickNotes");

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Toggle Buttons */}
      <div className="flex flex-col sm:flex-row pr-8 gap-3 m-4 w-full">
        {toggleSections.map((key) => {
          const isActive = activeToggle === key;
          return (
            <button
              key={key}
              title={`View ${sectionTitles[key]}`}
              onClick={() => setActiveToggle(key)}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer
                ${isActive
                  ? "bg-[#03045e] text-white shadow-[0_4px_#999] active:shadow-[0_2px_#666]"
                  : "bg-gray-100 text-gray-800 hover:bg-[#0077b6] hover:text-white shadow-[0_4px_#999] active:shadow-[0_2px_#666]"
                }
              `}
            >
              {sectionTitles[key]}
            </button>
          );
        })}
      </div>

      {/* Content Display */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4 h-full">
          <h3 className="text-base sm:text-lg font-semibold text-[#023e8a] mb-3">
            {sectionTitles[activeToggle]}
          </h3>

          {medicalHistory?.[activeToggle]?.length > 0 ? (
            <NoteList
              items={medicalHistory[activeToggle]}
              type={activeToggle}
              key={activeToggle}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">
              No records found for this section.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToggleMedicalSection;