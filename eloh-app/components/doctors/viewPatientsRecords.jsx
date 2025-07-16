"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import NotePreview from "@/components/editor/NotePreview";

const noteTypes = [
  { id: "generalNotes", type: "generalNotes", label: "General Notes" },
  { id: "prescriptions", type: "prescriptions", label: "Prescriptions" },
  { id: "sickNotes", type: "sickNotes", label: "Sick Notes" },
];

const ViewPatientsRecords = ({ data, setOpenViewPatientRecords }) => {
  const [mode, setMode] = useState(noteTypes[0].type);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (data && data[mode]) {
      const notesObject = data[mode];
      const notesArray = Object.values(notesObject); // 👈 convert to array
      setSelectedNotes(notesArray);
    } else {
      setSelectedNotes([]);
    }
  }, [data, mode]);

  if (!data) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No medical history found for this patient.
      </div>
    );
  }

  return (
    <div className="text-[#333] p-8 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Patient Records</h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {noteTypes.map(({ id, type, label }) => (
          <button
            key={id}
            onClick={() => setMode(type)}
            className={`px-4 py-2 rounded-md font-medium shadow ${
              mode === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto relative bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={() => {
              setSelectedRecord(null);
              setSelectedNotes([]);
              setOpenViewPatientRecords(false);
            }}
            className="text-gray-500 hover:text-red-600 text-xl"
            aria-label="Close Table"
          >
            <FiX />
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
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center">
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
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      const content = record.content;
                      console.log(content, "CONTENT");
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
        />
      )}
    </div>
  );
};

export default ViewPatientsRecords;
