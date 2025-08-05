"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import ViewMedicalRecords from "../viewMedicalRecords";
import StaffScroller from "./StaffController";

const PatientMeetingSetup = ({ mode, noteOpen, userDoc, setNoteOpen }) => {
  const { currentUser, loading } = useCurrentUser();
  const [roomID, setRoomID] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const patientRef = doc(db, "patients", currentUser?.uid);
    let unsubDoctors = () => {};
    let unsubNurses = () => {};

    const unsubPatient = onSnapshot(
      patientRef,
      (patientSnap) => {
        if (!patientSnap.exists()) {
          setError("Patient data not found.");
          setDoctors([]);
          setNurses([]);
          return;
        }

        const { consultationType } = patientSnap.data();

        setIsLoading(true);
        setError(null);

        // Unsubscribe previous listeners
        unsubDoctors();
        unsubNurses();

        if (consultationType === "doctor" || consultationType === "all") {
          const doctorQuery = query(
            collection(db, "doctors"),
            where("available", "==", true)
          );

          unsubDoctors = onSnapshot(
            doctorQuery,
            (snapshot) => {
              const docs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setDoctors(docs);
            },
            (err) => {
              console.error("Doctor snapshot error:", err);
              setDoctors([]);
            }
          );
        }

        if (consultationType === "nurse" || consultationType === "all") {
          const nurseQuery = query(
            collection(db, "nurses"),
            where("available", "==", true)
          );

          unsubNurses = onSnapshot(
            nurseQuery,
            (snapshot) => {
              const docs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setNurses(docs);
            },
            (err) => {
              console.error("Nurse snapshot error:", err);
              setNurses([]);
            }
          );
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Patient snapshot error:", error);
        setError("Error fetching patient data.");
        setIsLoading(false);
      }
    );

    // Cleanup all listeners
    return () => {
      unsubPatient();
      unsubDoctors();
      unsubNurses();
    };
  }, [currentUser?.uid]);

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
          credentials: "include",
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

  const totalStaff = doctors.length + nurses.length;
  const showArrows = totalStaff >= 4;

  return (
    <div className="w-full min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 pt-5">
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

        {isLoading ? (
          <p className="text-center text-gray-500 mt-20">
            Loading doctors & nurses...
          </p>
        ) : error ? (
          <p className="text-red-600 text-center mt-20 font-semibold">
            {error}
          </p>
        ) : doctors.length === 0 && nurses.length === 0 ? (
          <p className="text-gray-600 text-center mt-20 italic">
            No Staff available
          </p>
        ) : (
          <div className="relative mt-10">
            {/* Conditionally show scroll buttons */}
            {showArrows && (
              <>
                <button
                  onClick={() => scroll("left")}
                  title="Scroll left"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={() => scroll("right")}
                  title="Scroll right"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
                >
                  <FaArrowRight />
                </button>
              </>
            )}

            {/* Scrollable Cards */}
            <StaffScroller
              doctors={doctors}
              nurses={nurses}
              sendNotificationToDoctor={sendNotificationToDoctor}
              ref={scrollRef}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMeetingSetup;
