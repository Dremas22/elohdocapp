"use client";

import { useState, useEffect } from "react";
import { MdCloseFullscreen } from "react-icons/md";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NotePreview from "@/components/editor/NotePreview";
import { truncate } from "@/lib/truncate";

const noteTypes = [
  { id: "generalNotes", type: "generalNotes", label: "Patient Files" },
  { id: "prescriptions", type: "prescriptions", label: "Prescriptions" },
  { id: "sickNotes", type: "sickNotes", label: "Sick Notes" },
];

/**
 * ViewPatientsRecords component
 *
 * This component displays a patient's medical records, categorized into note types such as general notes,
 * prescriptions, and sick notes. It allows switching between categories and shows a preview modal
 * for individual records when selected.
 *
 * Props:
 * @param {Object} props - Component props
 * @param {Object} props.data - All medical notes categorized by type (e.g., generalNotes, prescriptions, sickNotes)
 * @param {Function} props.setOpenViewPatientRecords - Setter function to toggle visibility of the records view
 * @param {string} props.signature - Base64 or URL string representing the doctor's digital signature
 * @param {string} props.patientId - The ID of the patient whose records are being viewed
 *
 * Features:
 * - Tabbed switching between types of medical records
 * - Table view with date, doctor name, and truncated summary
 * - Dynamically renders different summary formats depending on the note type
 * - Opens a modal preview for full note detail
 */

const ViewPatientsRecords = ({
  data,
  setOpenViewPatientRecords,
  signature,
  patientId,
}) => {
  const [mode, setMode] = useState(noteTypes[0].type);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (data && data[mode]) {
      const notesObject = data[mode];
      const notesArray = Object.values(notesObject);
      setSelectedNotes(notesArray);
    } else {
      setSelectedNotes([]);
    }
  }, [data, mode]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-center text-gray-500">
        No medical history found for this patient.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-100">
        Patient Medical Records
      </h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {noteTypes.map(({ id, type, label }) => (
          <div key={id} className="relative group">
            <button
              onClick={() => setMode(type)}
              className={`py-2 px-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
                  ${mode === type
                  ? "bg-[#2c4253] text-white hover:bg-[#023e8a]"
                  : "bg-[#03045e] text-white hover:bg-[#023e8a]"
                }
                `}
            >
              {label}
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Switch to {label} view
            </div>
          </div>
        ))}
      </div>

      {/* Table Section - Centered */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-5xl overflow-auto">
        <div className="flex justify-end px-3 pt-3">
          <button
            title="close table"
            onClick={() => setOpenViewPatientRecords(false)}
            className="text-gray-500 hover:text-red-600 text-xl cursor-pointer"
            aria-label="Close Table"
          >
            <MdCloseFullscreen />
          </button>
        </div>

        <table className="min-w-full table-fixed text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 text-center text-gray-600 font-semibold">
                Date
              </th>
              <th className="px-2 py-3 text-center text-gray-600 font-semibold">
                Doctor
              </th>
              <th className="px-2 py-3 text-center text-gray-600 font-semibold">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedNotes.length > 0 ? (
              selectedNotes.map((record, index) => (
                <tr
                  key={index}
                  className="text-gray-800 cursor-pointer transition"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="px-2 py-4 text-center">
                    {convertTimestamp(record?.createdAt)}
                  </td>
                  <td className="px-2 py-4 text-center">{record.doctorName || "N/A"}</td>
                  <td className="px-2 py-4 text-center">
                    {(() => {
                      const content = record.content;
                      if (typeof content === "string") return truncate(content);
                      if (typeof content === "object") {
                        if (content.instructions) return truncate(content.instructions);
                        if (content.reason) return truncate(`Reason: ${content.reason}`);
                        if (content.startDate && content.endDate) {
                          return `From ${convertTimestamp(content.startDate)} to ${convertTimestamp(content.endDate)}`;
                        }
                      }
                      return "View full note";
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center px-6 py-4 text-gray-500">
                  No {noteTypes.find((type) => type.type === mode)?.label} available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Preview - only on note click */}
      {selectedRecord && (
        <NotePreview
          previewData={selectedRecord}
          isLoading={false}
          onClose={() => setSelectedRecord(null)}
          noteType={mode}
          signature={signature}
          patientId={patientId}
        />
      )}
    </div>
  );
};

export default ViewPatientsRecords;
