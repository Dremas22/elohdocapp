"use client";

import Image from "next/image";

const buttonModes = [
  { id: "note", label: "Note" },
  { id: "prescription", label: "Prescription" },
  { id: "sick-note", label: "Sick Note" },
];

const MeetingRoomNavbar = ({ patientData, mode, setMode }) => {
  return (
     <div className="flex flex-col gap-4 mb-4 w-full">
      {/* Row 1: Full-width Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {buttonModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
              mode === m.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Row 2: Patient Info + Image (Responsive) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 p-4 rounded shadow-md">
        {/* Patient Info (left-aligned) */}
        <div className="text-sm text-gray-200 w-full md:w-auto md:text-left text-center">
          <p className="font-semibold">{patientData?.fullName || "Unknown"}</p>
          <p>{patientData?.email || "No email"}</p>
          <p>{patientData?.phoneNumber || "No phone"}</p>
        </div>

        {/* Patient Image (right side) */}
        <div className="flex justify-end w-full md:w-auto">
          <Image
            src="/images/elohdoc.png"
            alt="Eloh App Logo"
            width={48}
            height={48}
            className="rounded-full border border-gray-400 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomNavbar;
