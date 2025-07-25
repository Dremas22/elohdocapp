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
 * NoteList component displays a list of notes with professional styling.
 *
 * Props:
 * - items: Array of note objects (sickNotes, prescriptions, or generalNotes)
 * - type: string indicating type: "sickNotes" | "prescriptions" | "generalNotes"
 * - renderDate: function to format date objects
 */
const NoteList = ({ items, type }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm italic text-gray-500">
        No records found for this section.
      </p>
    );
  }

  const renderDate = (date) => {
    if (!date) return "N/A";
    if (typeof date === "string") return date;
    return convertTimestamp(date);
  };

  return (
    <div className="bg-gray-100 min-h-full p-6">
      <div className="space-y-6">
        {items.map((item, idx) => {
          if (type === "sickNotes") {
            return (
              <article
                key={idx}
                className="bg-white rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`Sick Note for ${
                  item.patientName || "Unknown Patient"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                  <p className="flex items-center gap-2">
                    <FaUser className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Patient:
                    </span>{" "}
                    {item.patientName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaStethoscope className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Doctor:
                    </span>{" "}
                    {item.doctorName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Start Date:
                    </span>{" "}
                    {renderDate(item.content?.startDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      End Date:
                    </span>{" "}
                    {renderDate(item.content?.endDate)}
                  </p>
                  <p className="col-span-full flex items-start gap-2">
                    <FaNotesMedical className="text-[#023e8a] mt-1" />
                    <span className="font-semibold text-[#023e8a]">
                      Reason:
                    </span>{" "}
                    {item.content?.reason || "N/A"}
                  </p>
                </div>
              </article>
            );
          }

          if (type === "prescriptions") {
            return (
              <article
                key={idx}
                className="bg-white rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`Prescription for ${
                  item.patientName || "Unknown Patient"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                  <p className="flex items-center gap-2">
                    <FaUser className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Patient:
                    </span>{" "}
                    {item.patientName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaStethoscope className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Doctor:
                    </span>{" "}
                    {item.doctorName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Date Issued:
                    </span>{" "}
                    {renderDate(item.content?.date)}
                  </p>
                  <p className="flex items-center gap-2 col-span-full">
                    <FaPills className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Medications:
                    </span>{" "}
                    {item.content?.medications?.join(", ") || "N/A"}
                  </p>
                  <p className="flex items-center gap-2 col-span-full">
                    <FaClipboardList className="text-[#023e8a]" />
                    <span className="font-semibold text-[#023e8a]">
                      Instructions:
                    </span>{" "}
                    {item.content?.instructions || "N/A"}
                  </p>
                </div>
              </article>
            );
          }

          if (type === "generalNotes") {
            return (
              <article
                key={idx}
                className="bg-white rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition-shadow duration-300"
                role="region"
                aria-label={`General Note for ${
                  item.patientName || "Unknown Patient"
                }`}
              >
                <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                  {item.content || "N/A"}
                </p>
                <div className="mt-4 text-xs text-gray-500 italic">
                  Created At: {renderDate(item.createdAt)}
                </div>
                <div className="mt-2 flex gap-2 text-gray-800 text-sm items-center">
                  <FaUser className="text-[#023e8a]" />
                  <span className="font-semibold text-[#023e8a]">
                    Patient:
                  </span>{" "}
                  {item.patientName || "N/A"}
                </div>
                <div className="flex gap-2 text-gray-800 text-sm items-center">
                  <FaStethoscope className="text-[#023e8a]" />
                  <span className="font-semibold text-[#023e8a]">
                    Doctor:
                  </span>{" "}
                  {item.doctorName || "N/A"}
                </div>
              </article>
            );
          }

          return (
            <p
              key={idx}
              className="bg-white rounded-lg shadow-md border border-gray-300 p-6 text-center text-gray-500 italic"
            >
              Unknown Note Type
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default NoteList;
