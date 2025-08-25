"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import ViewMedicalRecords from "../viewMedicalRecords";
import StaffScroller from "./StaffController";
import Link from "next/link";
import { sendNotificationToDoctor } from "@/lib/sendNotificationToStaff";

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
        unsubDoctors();
        unsubNurses();

        if (consultationType === "doctor" || consultationType === "all") {
          const doctorQuery = query(
            collection(db, "doctors"),
            where("available", "==", true)
          );
          unsubDoctors = onSnapshot(doctorQuery, (snapshot) => {
            setDoctors(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          });
        }

        if (consultationType === "nurse" || consultationType === "all") {
          const nurseQuery = query(
            collection(db, "nurses"),
            where("available", "==", true)
          );
          unsubNurses = onSnapshot(nurseQuery, (snapshot) => {
            setNurses(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
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
    <div className="w-full min-h-screen bg-gray-950 relative pb-10">
      {/* Consultations Remaining Box */}
      <div className="w-full flex justify-center sm:justify-end px-4 pt-1.5">
        <div className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full max-w-xs text-center transform transition-transform duration-300 hover:scale-100 hover:shadow-[#0d6efd]/50 cursor-default">
          <h2 className="text-sm font-bold mb-2 tracking-wide text-gray-200 drop-shadow-md">
            Consultations Remaining
          </h2>
          <div className="text-white text-sm flex justify-center gap-x-6">
            <p>
              Doctor: <span className="font-bold text-gray-300">{doctor}</span>
            </p>
            <p>
              Nurse: <span className="font-bold text-gray-300">{nurse}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pt-2">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-2">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-3xl sm:text-4xl leading-tight">
            Virtual Medical Consultations
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl text-gray-300 text-base sm:text-xl">
            Connect with licensed medical professionals through secure video
            consultations from home.
          </p>
        </div>

        {/* Hidden Inputs */}
        <div className="opacity-0 h-0 overflow-hidden mt-6">
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

        {/* Loading/Error/Empty State */}
        {isLoading ? (
          <p className="text-center text-gray-400 mt-20 text-sm sm:text-base">
            Loading doctors & nurses...
          </p>
        ) : error ? (
          <p className="text-red-600 text-center mt-20 font-semibold">
            {error}
          </p>
        ) : doctor === 0 && nurse === 0 ? (
          <div className="text-center mt-10 text-gray-600 text-sm sm:text-base">
            <p className="italic mb-2">
              No consultation staff available because no payment has been made.
            </p>
            <span>
              Make a{" "}
              <Link
                href="/payment"
                title="Go to payment page"
                className="text-blue-600 underline hover:text-blue-800 font-medium"
              >
                payment
              </Link>{" "}
              to continue
            </span>
          </div>
        ) : (
          <>
            {doctor > 0 && doctors.length === 0 && (
              <div className="text-center text-yellow-500 text-sm sm:text-base">
                <p className="italic">No available doctors at the moment.</p>
              </div>
            )}

            {nurse > 0 && nurses.length === 0 && (
              <div className="text-center text-yellow-500 text-sm sm:text-base">
                <p className="italic">No available nurses at the moment.</p>
              </div>
            )}
            <StaffScroller
              doctors={doctors}
              nurses={nurses}
              sendNotificationToDoctor={sendNotificationToDoctor}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PatientMeetingSetup;
