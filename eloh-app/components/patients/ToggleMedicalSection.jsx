"use client";

import { useState } from "react";
import NoteList from "./NoteList";

const ToggleMedicalSection = ({ medicalHistory }) => {
  const sectionTitles = {
    sickNotes: "Sick Notes",
    prescriptions: "Prescriptions",
    generalNotes: "General Notes",
  };

  const toggleSections = Object.keys(sectionTitles);
  const [activeToggle, setActiveToggle] = useState("sickNotes");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toggle Buttons - Horizontal */}
      <div className="flex flex-wrap gap-3 mb-4">
        {toggleSections.map((key) => (
          <button
            key={key}
            onClick={() => setActiveToggle(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              activeToggle === key
                ? "bg-[#023e8a] text-white border-[#023e8a]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {sectionTitles[key]}
          </button>
        ))}
      </div>

      {/* Scrollable Content Area */}
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
