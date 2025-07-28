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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toggle Buttons - Stack on mobile, inline on desktop */}
      <div className="flex flex-wrap gap-3 mb-6 ">
        {toggleSections.map((key) => {
          const isActive = activeToggle === key;
          return (
            <button
              key={key}
              onClick={() => setActiveToggle(key)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 
                ${isActive
                  ? "bg-[#03045e] text-white"
                  : "bg-[#0507aa] text-white"
                } 
                bg-[#03045e] text-white py-2 px-4 text-sm sm:text-base font-semibold rounded-xl
                shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 
                hover:bg-[#0077b6] transition-all duration-200 ease-in-out 
                cursor-pointer disabled:cursor-not-allowed`}
            >
              {sectionTitles[key]}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[#023e8a] mb-2">
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
