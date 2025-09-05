"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import ViewMedicalRecords from "../viewMedicalRecords";
import Link from "next/link";
import ElohDocChatApp from "../chat-app/ElohDocChatApp";

/**
 * PatientMeetingSetup component
 *
 * This component sets up and manages virtual medical consultation sessions for patients.
 * It fetches available doctors and nurses in real-time based on the patient's consultation type,
 * displays consultation credits remaining, and shows medical records if requested.
 * It also allows notifying doctors when a patient requests a consultation.
 *
 * Props:
 * @param {string} mode - Mode of operation, e.g., which staff category to display
 * @param {boolean} noteOpen - Flag indicating if the medical records view is open
 * @param {Object} userDoc - Current patient document containing consultation data and other details
 * @param {Function} setNoteOpen - Setter function to toggle the medical records view
 *
 * State:
 * - roomID: ID for the virtual consultation room (currently unused in UI)
 * - doctors: List of available doctors filtered by availability and consultation type
 * - nurses: List of available nurses filtered similarly
 * - isLoading: Loading state while fetching doctors/nurses
 * - error: Stores any error messages during fetching
 *
 * Effects:
 * - Subscribes to the current patient's Firestore document to retrieve consultation type,
 *   then sets up real-time listeners for available doctors and nurses accordingly.
 * - Cleans up all listeners on unmount or user change.
 *
 * Features:
 * - Displays consultations remaining (doctor and nurse counts)
 * - Conditionally renders medical records view if requested
 * - Handles loading, error, and empty states gracefully
 * - Provides a clickable link to the payment page if no consultation credits remain
 * - Integrates a StaffScroller component to show available staff and handle notifications
 */

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
  const { doctor, nurse } = userDoc?.consultations ?? { doctor: 0, nurse: 0 };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 px-4">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="lg:w-[168.5vh] w-full pl-5 min-h-screen bg-gray-950 relative pb-10">
      {/* Consultations Remaining */}
      <div className="pt-10 lg:pr-50 -mr-3 flex justify-center">
        <div className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full max-w-xs text-center transform transition-transform duration-300 hover:shadow-[#0d6efd]/50">
          <h2 className="text-sm font-bold mb-2 tracking-wide text-[#90e0ef]">
            Consultations Remaining
          </h2>
          <div className="text-[#90e0ef] text-lg flex flex-col sm:flex-row justify-center gap-2 sm:gap-x-6">
            <p>
              Doctor: <span className="font-bold">{doctor}</span>
            </p>
            <p>
              Nurse: <span className="font-bold">{nurse}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mt-6 lg:pr-50 px-4 sm:px-6 text-center">
        <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-2xl sm:text-3xl md:text-4xl">
          Welcome to Your Virtual Medical Consultation
        </h1>
        <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-gray-300 text-sm sm:text-base md:text-lg">
          Connect with licensed professionals securely from the comfort of your home.
        </p>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        {/* Hidden Inputs */}
        <div className="opacity-0 h-0 overflow-hidden">
          <input
            type="text"
            readOnly
            value={fullName}
            className="border rounded-md px-4 py-2 text-black bg-gray-100 cursor-not-allowed w-full mb-2"
          />
          <input
            type="text"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            className="border rounded-md px-4 py-2 text-black bg-white w-full"
            placeholder="Room ID"
          />
        </div>

        {/* Medical Records */}
        {noteOpen && (
          <div className="mt-6">
            <ViewMedicalRecords userDoc={userDoc} mode={mode} setNoteOpen={setNoteOpen} />
          </div>
        )}

        {/* State Handling */}
        {isLoading ? (
          <p className="text-center text-gray-400 mt-12 text-sm sm:text-base">
            Loading doctors & nurses...
          </p>
        ) : error ? (
          <p className="text-red-600 text-center mt-12 font-semibold">{error}</p>
        ) : doctor === 0 && nurse === 0 ? (
          <div className="text-center lg:pr-40 mt-10 text-gray-400">
            <p className="italic mb-2">
              No consultation staff available because no payment has been made.
            </p>
            <Link
              href="/payment"
              className="text-blue-500 underline hover:text-blue-700 font-medium"
            >
              Make a payment to continue
            </Link>
          </div>
        ) : (
          <main className="lg:w-[90vw] w-[49.5vh] lg:ml-[50px] -ml-[40px] flex flex-col flex-grow h-full mt-6">
            <div className="flex flex-col flex-grow overflow-auto px-2 sm:px-4">
              <ElohDocChatApp role="patient" />
            </div>
          </main>

        )}
      </div>
    </div>
  );
};

export default PatientMeetingSetup;
