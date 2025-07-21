"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

const NotePreview = ({ previewData, noteType, isLoading, onClose }) => {
  if (isLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <p className="text-white text-lg font-semibold animate-pulse">
          Loading Preview...
        </p>
      </div>
    );

  if (!previewData)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <p className="text-gray-300 text-lg">No preview data available.</p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl shadow-2xl relative border border-gray-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#03045e] text-3xl font-bold transition"
          aria-label="Close Preview"
        >
          &times;
        </button>

        {/* Letterhead */}
        <div className="flex justify-between items-center border-b pb-4 mb-5 mt-3 border-gray-300">
          <div className="w-20 h-20 rounded-full bg-[#caf0f8] text-[#03045e] font-semibold flex items-center justify-center text-sm shadow-inner">
            LOGO
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#03045e]">
              {previewData?.doctorName}
            </p>
            <p className="text-sm text-gray-600">
              {previewData?.doctorEmail}
            </p>
            <p className="text-sm text-gray-600">
              {previewData?.phoneNumber}
            </p>
          </div>
        </div>

        {/* Note Content */}
        <div className="text-gray-800 space-y-6">
          {/* Professional Sick Note */}
          {noteType === "sickNotes" && (
            <div className="font-serif text-[16px] sm:text-[17px] leading-loose text-justify text-gray-800">
              <h2 className="text-2xl font-bold text-center text-[#263a74] mb-4 underline">
                Sick Note
              </h2>

              {/* Date */}
              <div className="text-right mb-4">
                <span className="font-semibold">Date:</span>{" "}
                <span className="border-b border-gray-500 inline-block min-w-[140px] text-center">
                  {convertTimestamp(previewData?.content?.issuedDate) ||
                    "__________"}
                </span>
              </div>

              <p className="mb-2">To Whom It May Concern,</p>

              <p className="mb-2">
                This letter serves as an official medical excuse for:
                <br />
                <span className="block text-center font-mono border-b border-gray-400 mt-2 px-2 py-1">
                  {previewData?.content?.patientName ||
                    "_____________________________"}
                </span>
              </p>

              <p className="mb-2">
                who was under my care on:
                <br />
                <span className="block text-center font-mono border-b border-gray-400 mt-2 px-2 py-1">
                  {convertTimestamp(previewData?.content?.visitDate) ||
                    "__________________"}
                </span>
              </p>

              <p className="mb-2">
                due to a medical condition that required rest and/or treatment. I
                have evaluated the patient and determined that they were unable
                to attend work/school/other obligations from:
              </p>

              <div className="flex justify-center gap-3 mt-2 mb-4">
                <div className="text-center">
                  <p className="border-b border-gray-400 font-mono inline-block min-w-[120px] py-1">
                    {convertTimestamp(previewData?.content?.startDate) ||
                      "__________"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Start Date</p>
                </div>
                <div className="text-center">
                  <p className="border-b border-gray-400 font-mono inline-block min-w-[120px] py-1">
                    {convertTimestamp(previewData?.content?.endDate) ||
                      "__________"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">End Date</p>
                </div>
              </div>

              <p className="mb-6">
                If further accommodations or verification are required, please
                feel free to contact my office.
              </p>

              {/* Signature Section */}
              <div className="mt-5 space-y-1">
                <p className="font-semibold">Sincerely,</p>
                <div className="mt-1">
                  <p className="border-b border-gray-500 inline-block min-w-[250px] py-1">
                    {previewData?.doctorName || "__________________________"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Medical License #{" "}
                    {previewData?.doctorpracticeNumber ||
                      "______________________"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Note */}
          {noteType === "prescriptions" && (
            <div>
              <h2 className="text-2xl font-semibold text-center text-[#03045e] underline mb-4">
                Prescription
              </h2>
              <div className="space-y-4 text-base bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {convertTimestamp(previewData?.content?.date)}
                </p>
                <div>
                  <p className="font-semibold mb-2">Medications:</p>
                  {Array.isArray(previewData?.content?.medications) ? (
                    <ul className="list-disc list-inside pl-4">
                      {previewData.content.medications.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : typeof previewData?.content?.medications === "object" &&
                    previewData.content.medications !== null ? (
                    <ul className="list-disc list-inside pl-4">
                      {Object.values(
                        previewData.content.medications
                      ).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">
                      No medications listed
                    </p>
                  )}
                </div>
                <p>
                  <span className="font-medium">Instructions:</span>{" "}
                  {previewData.content.instructions}
                </p>
              </div>
            </div>
          )}

          {/* General Note */}
          {noteType === "generalNotes" && (
            <div>
              <h2 className="text-2xl font-semibold text-center text-[#03045e] underline mb-6">
                General Medical Note
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl whitespace-pre-line text-base">
                {previewData.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
