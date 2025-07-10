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
        const docRef = doc(db, "doctors", doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDoctorData(docSnap.data());
        } else {
          console.warn("No such doctor found!");
          setDoctorData(null);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  return (
    <div className="flex flex-col gap-4 mb-4 w-full">
      {/* Row 1: Buttons */}
      <div className="flex justify-center gap-6 w-full flex-wrap">
        {buttonModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`w-32 sm:w-36 py-3 px-8 text-base font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-6 ${
              mode === m.id
                ? "bg-[#03045e] text-white hover:bg-[#023e8a]"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Row 2: Doctor Info + Logo */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-700 p-4 rounded shadow-md">
        {/* Doctor Info */}
        <div className="text-sm text-gray-200 w-full md:w-auto md:text-left text-center">
          <p className="font-semibold">
            {doctorData?.fullName || "Unknown Doctor"}
          </p>
          <p>{doctorData?.email || "Email N/A"}</p>
          <p>{doctorData?.phoneNumber || "Contacts N/A"}</p>
        </div>

        {/* Enlarged Logo Without Increasing Navbar Height */}
        <div className="flex justify-end w-full md:w-auto">
          <div className="w-[70px] h-[60px] relative scale-350">
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
