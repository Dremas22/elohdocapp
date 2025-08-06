"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import ViewMedicalRecords from "../viewMedicalRecords";
import StaffScroller from "./StaffController";

const PatientMeetingSetup = ({ mode, noteOpen, userDoc, setNoteOpen }) => {
  const { currentUser, loading } = useCurrentUser();
  const [roomID, setRoomID] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const patientRef = doc(db, "patients", currentUser.uid);
    let unsubDoctors = () => { };
    let unsubNurses = () => { };

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
        unsubDoctors();
        unsubNurses();

        if (consultationType === "doctor" || consultationType === "all") {
          const doctorQuery = query(
            collection(db, "doctors"),
            where("available", "==", true)
          );
          unsubDoctors = onSnapshot(doctorQuery, (snapshot) => {
            setDoctors(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          });
        }

        if (consultationType === "nurse" || consultationType === "all") {
          const nurseQuery = query(
            collection(db, "nurses"),
            where("available", "==", true)
          );
          unsubNurses = onSnapshot(nurseQuery, (snapshot) => {
            setNurses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          });
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Patient snapshot error:", error);
        setError("Error fetching patient data.");
        setIsLoading(false);
      }
    );

    return () => {
      unsubPatient();
      unsubDoctors();
      unsubNurses();
    };
  }, [currentUser?.uid]);

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
      if (!res.ok) throw new Error(data.error);
    } catch (error) {
      console.error("Notification error:", error);
      alert("Failed to send notification.");
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
      <div className="max-w-screen-xl mx-auto px-4 pt-5">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-4xl">
            Virtual Medical Consultations
          </h1>
          <p className="mt-6 max-w-xl text-gray-300 sm:text-xl">
            Connect with licensed medical professionals through secure video consultations from home.
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
          <p className="text-center text-gray-500 mt-20">Loading doctors & nurses...</p>
        ) : error ? (
          <p className="text-red-600 text-center mt-20 font-semibold">{error}</p>
        ) : doctors.length === 0 && nurses.length === 0 ? (
          <div className="text-center mt-20 text-gray-600">
            <p className="italic mb-2">No consultation staff available because no payment has been made.</p>
            <a
              href="/patient/payments"
              className="text-blue-600 underline hover:text-blue-800 font-medium"
            >
              Make a payment to continue
            </a>
          </div>
        ) : (
          <StaffScroller
            doctors={doctors}
            nurses={nurses}
            sendNotificationToDoctor={sendNotificationToDoctor}
          />
        )}
      </div>
    </div>
  );
};

export default PatientMeetingSetup;
