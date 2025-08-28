"use client";

import { useUserStore } from "@/hooks/useUserStore";
import { useEffect, useState } from "react";
import { FiLoader, FiCalendar, FiClock, FiX } from "react-icons/fi";
import Link from "next/link";
import { getTimeUntil } from "@/lib/timeUntil";

const Appointments = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!currentUser) return;
    try {
      setApptLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments`,
        { method: "GET" }
      );
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAppointments(data.appointments || []);
      } else {
        console.error("Failed to load appointments.");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setApptLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser?.userId]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
        <div className="absolute right-3 top-3">
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
               text-gray-600 dark:text-gray-300 
               hover:text-gray-900 dark:hover:text-white 
               transition-colors duration-200"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Appointments
        </h2>

        {/* Loading State */}
        {apptLoading ? (
          <div className="flex justify-center items-center h-40">
            <FiLoader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading appointments...
            </span>
          </div>
        ) : (
          <>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {appointments.map((appt, idx) => (
                  <Link
                    key={idx}
                    href={appt?.link || appt?.meetingLink}
                    className="block bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {appt.patientName} with {appt.staffName}
                      </h3>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {getTimeUntil(appt.date, appt.time)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center space-x-4 text-gray-600 dark:text-gray-300 text-sm">
                      <span className="flex items-center">
                        <FiCalendar className="mr-1" /> {appt.date}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-1" /> {appt.time}
                      </span>
                    </div>

                    {appt.note && (
                      <p className="mt-2 text-gray-700 dark:text-gray-400 text-sm">
                        <span className="font-medium">Note:</span> {appt.note}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No appointments found.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;
