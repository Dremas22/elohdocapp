"use client";

import { useState, useEffect } from "react";
import { MdCloseFullscreen } from "react-icons/md";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NotePreview from "@/components/editor/NotePreview";

const noteTypes = [
  { id: "generalNotes", type: "generalNotes", label: "Patient Files" },
  { id: "prescriptions", type: "prescriptions", label: "Prescriptions" },
  { id: "sickNotes", type: "sickNotes", label: "Sick Notes" },
];

const ViewPatientsRecords = ({
  data,
  setOpenViewPatientRecords,
  signature,
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
      <div className="text-center text-gray-500 mt-2">
        No medical history found for this patient.
      </div>
    );
  }

  return (
    <div className="text-[#333] p-8 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl text-gray-200 font-bold mb-6 text-center">
        Patient Records
      </h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {noteTypes.map(({ id, type, label }) => (
          <button
            key={id}
            onClick={() => setMode(type)}
            className={`py-2 px-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out
        ${mode === type
                ? "bg-[#2c4253] text-white hover:bg-[#023e8a]" // lighter blue for active + darker text
                : "bg-[#03045e] text-white hover:bg-[#023e8a]"
              }
      `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 w-[77vw] sm:w-full px-2 sm:px-6 text-sm sm:text-base -ml-11.5 sm:-ml-4">
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={() => {
              setSelectedRecord(null);
              setSelectedNotes([]);
              setOpenViewPatientRecords(false);
            }}
            className="text-gray-500 hover:text-red-600 text-xl"
            aria-label="Close Table"
          >
            <MdCloseFullscreen />
          </button>
        </div>

        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center">
                Date
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center">
                Doctor
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center hidden sm:table-cell">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedNotes.length > 0 ? (
              selectedNotes.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="px-6 py-4 text-center">
                    {convertTimestamp(record?.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {record.doctorName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center hidden sm:table-cell">
                    {(() => {
                      const content = record.content;
                      if (typeof content === "string") return content;
                      if (typeof content === "object") {
                        if (content.instructions) return content.instructions;
                        if (content.reason) return `Reason: ${content.reason}`;
                        if (content.startDate && content.endDate)
                          return `From ${convertTimestamp(
                            content.startDate
                          )} to ${convertTimestamp(content.endDate)}`;
                      }
                      return "View full note";
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center px-6 py-4 text-gray-500">
                  No {noteTypes.find((type) => type.type === mode)?.label}{" "}
                  available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Preview */}
      {selectedRecord && (
        <NotePreview
          previewData={selectedRecord}
          isLoading={false}
          onClose={() => setSelectedRecord(null)}
          noteType={mode}
          signature={signature}
        />
      )}
    </div>
  );
};

export default ViewPatientsRecords;
