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
      <div className="bg-white rounded-xl text-black p-6 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd]">
        {/* Close Button */}
        <button
          onClick={() => setNoteOpen(false)}
          className="absolute top-3 right-4 text-gray-600 hover:text-red-600 text-xl"
          aria-label="Close Table"
        >
          <FiX />
        </button>

        <h2 className="text-2xl font-bold mb-5 text-[#0d6efd] text-center capitalize">
          {mode.replace("-", " ")}
        </h2>

        <div className="overflow-x-auto max-h-[60vh]">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
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
                        if (typeof content === "string") return content;
                        if (typeof content === "object") {
                          if (content.instructions) return content.instructions;
                          if (content.reason) return `Reason: ${content.reason}`;
                          if (content.startDate && content.endDate)
                            return `From ${convertTimestamp(content.startDate)} to ${convertTimestamp(content.endDate)}`;
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
      </div>

      {/* Note Preview Modal */}
      {selectedRecord && (
        <NotePreview
          previewData={selectedRecord}
          isLoading={false}
          onClose={() => setSelectedRecord(null)}
          noteType={noteKeyMap[mode]}
        />
      )}
    </div>
  );
};

export default ViewMedicalRecords;