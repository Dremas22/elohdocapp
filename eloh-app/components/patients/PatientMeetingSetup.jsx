"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import ViewMedicalRecords from "../viewMedicalRecords";

const PatientMeetingSetup = ({ mode, noteOpen, userDoc, setNoteOpen }) => {
  const { currentUser, loading } = useCurrentUser();
  const [roomID, setRoomID] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
        setError("Error fetching doctors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "right" ? 320 : -320,
        behavior: "smooth",
      });
    }
  };

  const fullName = currentUser?.displayName || `Unknown-user_${Date.now()}`;

  const sendNotificationToDoctor = async (doctorId, patientId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId, patientId }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to send notification:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Notification error:", error);
      alert("Something went wrong while sending the notification.");
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-4xl">
            Virtual Medical Consultations
          </h1>
          <p className="mt-6 max-w-xl text-gray-300 sm:text-xl">
            Connect with licensed medical professionals through secure video
            consultations from the comfort of your home.
          </p>
        </div>

        {/* Hidden Inputs */}
        <div className="opacity-0 h-0 overflow-hidden mt-6">
          <input
            type="text"
            readOnly
            value={fullName}
            className="border rounded-md px-4 py-2 text-black bg-gray-100 cursor-not-allowed"
          />
          <input
            type="text"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            className="border rounded-md px-4 py-2 text-black bg-white"
            placeholder="Room ID"
          />
        </div>

        {/* Medical Records Preview */}
        {noteOpen && (
          <div className="mt-8">
            <ViewMedicalRecords
              userDoc={userDoc}
              mode={mode}
              setNoteOpen={setNoteOpen}
            />
          </div>
        )}

        {/* Available Doctors */}
        <h2 className="text-2xl font-semibold text-center mt-16 mb-6 text-white">
          Available Doctors
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500 mt-20">Loading doctors...</p>
        ) : error ? (
          <p className="text-red-600 text-center mt-20 font-semibold">
            {error}
          </p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-600 text-center mt-20 italic">
            No doctors available
          </p>
        ) : (
          <div className="relative mt-10">
            {/* Scroll Buttons */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
            >
              <FaArrowRight />
            </button>

            {/* Scrollable Cards */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto space-x-4 px-2 scrollbar-hide"
            >
              {doctors.map((doc) => (
                <div
                  key={doc.userId}
                  onClick={() => {
                    if (currentUser?.uid && doc.userId) {
                      sendNotificationToDoctor(doc.userId, currentUser.uid);
                      router.push(
                        `/room?doctorId=${doc.userId}&patientId=${currentUser.uid}`
                      );
                    }
                  }}
                  className={`min-w-[260px] sm:min-w-[280px] md:min-w-[300px] rounded-lg p-4 shadow-md flex-shrink-0 flex flex-col items-center gap-4 transition duration-200 ${currentUser?.uid && doc.userId
                    ? "cursor-pointer bg-[#123158] hover:bg-gray-700"
                    : "cursor-not-allowed bg-gray-700 opacity-50"
                    }`}
                >

                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-white">
                      {doc.fullName}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Practice No:{" "}
                      <span className="font-medium">{doc.practiceNumber}</span>
                    </p>
                    <p className="text-sm text-gray-300">{doc.email}</p>
                    <p className="text-sm text-gray-300">{doc.phoneNumber}</p>
                    <p className="text-sm text-blue-400 mt-2 hover:underline">
                      Click to join meeting
                    </p>
                  </div>
                  {doc.photoUrl && (
                    <Image
                      src={doc.photoUrl}
                      alt={doc.fullName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border border-white object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMeetingSetup;
