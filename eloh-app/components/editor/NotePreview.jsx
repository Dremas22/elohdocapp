"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

const NotePreview = ({ previewData, noteType, isLoading, onClose }) => {
  if (isLoading) return <p>Loading Preview...</p>;
  if (!previewData)
    return <p className="text-gray-400">No preview data available.</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-2xl relative border border-gray-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close Preview"
        >
          &times;
        </button>

        {/* Letterhead */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-sm text-gray-600">
            Logo
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#03045e]">
              {previewData.doctorName}
            </p>
            <p className="text-sm text-gray-600">{previewData.doctorEmail}</p>
            <p className="text-sm text-gray-600">{previewData.phoneNumber}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="text-gray-800 space-y-6">
          {noteType === "sickNotes" && (
            <div>
              <h2 className="text-lg font-bold text-center text-[#03045e] underline mb-4">
                Sick Note
              </h2>
              <div className="flex flex-col sm:flex-row sm:justify-center gap-6 text-center text-sm sm:text-base">
                <p>
                  <span className="font-semibold">Start Date:</span>{" "}
                  {convertTimestamp(previewData?.content?.startDate)}
                </p>
                <p>
                  <span className="font-semibold">End Date:</span>{" "}
                  {convertTimestamp(previewData?.content?.endDate)}
                </p>
              </div>
              <p className="mt-4 text-center">
                <span className="font-semibold">Reason for Absence:</span>{" "}
                {previewData.content.reason}
              </p>
            </div>
          )}

          {noteType === "prescriptions" && (
            <div>
              <h2 className="text-lg font-bold text-center text-[#03045e] underline mb-4">
                Prescription
              </h2>
              <div className="space-y-3 text-sm sm:text-base bg-gray-50 p-4 rounded-md border border-gray-200">
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {convertTimestamp(previewData?.content?.date)}
                </p>

                <div>
                  <p className="font-semibold mb-1">Medications:</p>
                  {Array.isArray(previewData?.content?.medications) ? (
                    <ul className="list-disc list-inside pl-4">
                      {previewData.content.medications.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : typeof previewData?.content?.medications === "object" &&
                    previewData.content.medications !== null ? (
                    <ul className="list-disc list-inside pl-4">
                      {Object.values(previewData.content.medications).map(
                        (item, index) => <li key={index}>{item}</li>
                      )}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No medications listed</p>
                  )}
                </div>

                <p>
                  <span className="font-semibold">Instructions:</span>{" "}
                  {previewData.content.instructions}
                </p>
              </div>
            </div>
          )}

          {noteType === "generalNotes" && (
            <div>
              <h2 className="text-lg font-bold text-center text-[#03045e] underline mb-4">
                General Medical Note
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-md whitespace-pre-line">
                {previewData.content}
              </div>
            </div>
          )}
        </div>

        {/* Signature Footer */}
        <div className="mt-10 text-right text-sm italic text-gray-600">
          Doctor's Signature
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
