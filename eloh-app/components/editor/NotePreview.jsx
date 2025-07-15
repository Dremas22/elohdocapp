"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

const NotePreview = ({ previewData, noteType, isLoading, onClose }) => {
  if (isLoading) {
    return <p>Loading Preview...</p>;
  }

  if (!previewData) {
    return <p className="text-gray-400">No preview data available.</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label="Close Preview"
        >
          ×
        </button>

        {/* Letterhead */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-400 pb-4">
          <div className="w-1/4">
            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              Logo
            </div>
          </div>
          <div className="text-right w-3/4">
            <p className="text-xl font-bold text-[#03045e]">
              {previewData.doctorName}
            </p>
            <p className="text-sm text-gray-600">{previewData.doctorEmail}</p>
            <p className="text-sm text-gray-600">{previewData.phoneNumber}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-gray-400 mb-6" />

        {/* Note Content */}
        {noteType === "sickNotes" && (
          <div>
            <h1 className="text-lg font-semibold underline mb-4">Sick Note</h1>
            <div className="space-y-2 text-gray-800">
              <p>
                <span className="font-medium">Start Date:</span>{" "}
                {convertTimestamp(previewData?.content?.startDate)}
              </p>
              <p>
                <span className="font-medium">End Date:</span>{" "}
                {convertTimestamp(previewData?.content?.endDate)}
              </p>
              <p>
                <span className="font-medium">Reason for Absence:</span>{" "}
                {previewData.content.reason}
              </p>
            </div>
          </div>
        )}

        {noteType === "prescriptions" && (
          <div>
            <h1 className="text-lg font-semibold underline mb-4">
              Prescription
            </h1>
            <div className="space-y-2 text-gray-800">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {convertTimestamp(previewData?.content?.date)}
              </p>
              <p>
                <span className="font-medium">Instructions:</span>{" "}
                {previewData.content.instructions}
              </p>
              <p className="font-medium">Medication:</p>
              <ul className="list-disc list-inside">
                {previewData?.content?.medications?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {noteType === "generalNotes" && (
          <div>
            <h1 className="text-lg font-semibold underline mb-4">
              General Medical Note
            </h1>
            <p className="text-gray-800 whitespace-pre-line">
              {previewData.content}
            </p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-8 text-right">
          <p className="italic text-sm">Doctor's Signature</p>
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
