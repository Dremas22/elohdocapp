"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/db/client";

const buttonModes = [
  { id: "note", label: "Note" },
  { id: "prescription", label: "Prescription" },
  { id: "sick-note", label: "Sick Note" },
];

const MeetingRoomNavbar = ({ mode, setMode, doctorId }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // Try to fetch from doctors collection
        let docRef = doc(db, "doctors", doctorId);
        let docSnap = await getDoc(docRef);

        let staffRole = "doctor";

        // If not found in doctors, try nurses
        if (!docSnap.exists()) {
          docRef = doc(db, "nurses", doctorId);
          docSnap = await getDoc(docRef);
          staffRole = "nurse";
        }

        if (docSnap.exists()) {
          setDoctorData({ ...docSnap.data(), role: staffRole });
        } else {
          console.warn("No such doctor or nurse found!");
          setDoctorData(null);
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setDoctorData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  return (
    <div className="flex flex-col gap-4 mb-4 w-full">
      {/* Row 1: Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full z-10">
        {buttonModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`w-full sm:w-36 py-3 px-8 text-base font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center ${
              mode === m.id
                ? "bg-[#03045e] text-white hover:bg-[#023e8a]"
                : "bg-[#506f95] text-white hover:bg-[#023e8a]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Row 2: Doctor Info + Logo */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 bg-gray-700 p-4 rounded shadow-md">
        {/* Doctor Info */}
        <div className="text-sm text-gray-200 w-full md:w-auto md:text-left text-center">
          <p className="font-semibold">
            {doctorData?.fullName || "Unknown Doctor"}
          </p>
          <p>{doctorData?.email || "Email N/A"}</p>
          <p>{doctorData?.phoneNumber || "Contacts N/A"}</p>
        </div>

        {/* Logo */}
        <div className="flex justify-center w-full md:w-auto">
          <div className="w-[70px] h-[60px] relative transform scale-300 sm:mr-3">
            <Image
              src="/images/elohdoc.png"
              alt="Eloh App Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomNavbar;
