"use client";

import { convertTimestamp } from "@/lib/convertFirebaseDate";
import {
  FaUser,
  FaStethoscope,
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaClipboardList,
} from "react-icons/fa";

/**
 * NoteList Component
 *
 * Renders different types of medical notes with consistent layout, icons, and colors.
 *
 * Props:
 * - items (array): Array of medical note objects
 * - type (string): One of "sickNotes", "prescriptions", or "generalNotes"
 */
const NoteList = ({ items, type }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm italic text-gray-500">
        No records found for this section.
      </p>
    );
  }

  // Format timestamp or string dates
  const renderDate = (date) => {
    if (!date) return "N/A";
    return typeof date === "string" ? date : convertTimestamp(date);
  };

  return (
    <div className="bg-gray-100 min-h-full p-4 sm:p-6">
      <div className="space-y-6">
        {items.map((item, idx) => {
          // ===== Sick Notes Layout =====
          if (type === "sickNotes") {
            return (
              <article
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`Sick Note for ${item.patientName || "Unknown Patient"}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-800">
                  <NoteLine icon={<FaUser />} label="Patient" value={item.patientName} />
                  <NoteLine icon={<FaStethoscope />} label="Doctor" value={item.doctorName} />
                  <NoteLine icon={<FaCalendarAlt />} label="Start Date" value={renderDate(item.content?.startDate)} />
                  <NoteLine icon={<FaCalendarAlt />} label="End Date" value={renderDate(item.content?.endDate)} />
                  <NoteLine icon={<FaNotesMedical />} label="Reason" value={item.content?.reason} full />
                </div>
              </article>
            );
          }

          // ===== Prescriptions Layout =====
          if (type === "prescriptions") {
            return (
              <article
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`Prescription for ${item.patientName || "Unknown Patient"}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-800">
                  <NoteLine icon={<FaUser />} label="Patient" value={item.patientName} />
                  <NoteLine icon={<FaStethoscope />} label="Doctor" value={item.doctorName} />
                  <NoteLine icon={<FaCalendarAlt />} label="Date Issued" value={renderDate(item.content?.date)} />
                  <NoteLine
                    icon={<FaPills />}
                    label="Medications"
                    value={item.content?.medications?.join(", ")}
                    full
                  />
                  <NoteLine
                    icon={<FaClipboardList />}
                    label="Instructions"
                    value={item.content?.instructions}
                    full
                  />
                </div>
              </article>
            );
          }

          // ===== General Notes Layout =====
          if (type === "generalNotes") {
            return (
              <article
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`General Note for ${item.patientName || "Unknown Patient"}`}
              >
                <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                  {item.content || "N/A"}
                </p>

                <div className="mt-4 text-xs text-gray-500 italic">
                  Created At: {renderDate(item.createdAt)}
                </div>

                <div className="mt-2 flex flex-col sm:flex-row gap-2 text-sm text-gray-800">
                  <NoteLine icon={<FaUser />} label="Patient" value={item.patientName} />
                  <NoteLine icon={<FaStethoscope />} label="Doctor" value={item.doctorName} />
                </div>
              </article>
            );
          }

          // ===== Unknown Type Fallback =====
          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-500 italic"
            >
              Unknown Note Type
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * NoteLine Component
 *
 * Reusable layout for icon + label + value
 */
const NoteLine = ({ icon, label, value, full = false }) => {
  return (
    <p className={`flex items-start gap-2 ${full ? "col-span-full" : ""}`}>
      <span className="text-[#023e8a] mt-1">{icon}</span>
      <span className="font-semibold text-[#023e8a]">{label}:</span>&nbsp;
      {value || "N/A"}
    </p>
  );
};

export default NoteList;
