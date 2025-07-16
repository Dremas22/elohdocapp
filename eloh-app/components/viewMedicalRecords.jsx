"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import NotePreview from "./editor/NotePreview";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

const ViewMedicalRecords = ({ userDoc, mode, setNoteOpen }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const noteKeyMap = {
    "general-notes": "generalNotes",
    prescriptions: "prescriptions",
    "sick-notes": "sickNotes",
  };

  const selectedNotes = userDoc?.medicalHistory?.[noteKeyMap[mode]] || [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px] z-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-6xl bg-white text-[#333] p-8 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setNoteOpen(false)}
            className="text-gray-500 hover:text-red-600 text-xl"
            aria-label="Close Table"
          >
            <FiX />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-[#0d6efd] mb-4">
          Medical Records
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
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

                        if (typeof content === "string") {
                          return content;
                        }

                        if (typeof content === "object") {
                          if (content.instructions) return content.instructions;
                          if (content.reason) return `Reason: ${content.reason}`;
                          if (content.startDate && content.endDate) {
                            return `From ${convertTimestamp(
                              content.startDate
                            )} to ${convertTimestamp(content.endDate)}`;
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
                    No {noteKeyMap[mode]} available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Nested Modal to view note details */}
        {selectedRecord && (
          <NotePreview
            previewData={selectedRecord}
            isLoading={false}
            onClose={() => setSelectedRecord(null)}
            noteType={noteKeyMap[mode]}
          />
        )}
      </div>
    </div>
  );
};

export default ViewMedicalRecords;
