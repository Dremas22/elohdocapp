"use client";

import Image from "next/image";

const buttonModes = [
  { id: "note", label: "Note" },
  { id: "prescription", label: "Prescription" },
  { id: "sick-note", label: "Sick Note" },
];

const MeetingRoomNavbar = ({ patientData, mode, setMode }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Mode Buttons */}
      <div className="flex gap-2">
        {buttonModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              mode === m.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Right: Logo + Patient Info */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Image
          src="/images/elohdoc.png"
          alt="Eloh App Logo"
          width={40}
          height={40}
          className="rounded-full object-cover border border-gray-400"
        />

        {/* Patient Info */}
        <div className="text-right text-sm text-gray-200">
          <p className="font-semibold">{patientData?.fullName || "Unknown"}</p>
          <p>{patientData?.email || "No email"}</p>
          <p>{patientData?.phoneNumber || "No phone"}</p>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomNavbar;
