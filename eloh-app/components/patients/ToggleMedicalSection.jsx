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
              className={'bg-[#03045e] text-white py-3 px-2 text-xs sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer'
              }
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