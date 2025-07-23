"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";

const NotePreview = ({
  previewData,
  noteType,
  isLoading,
  onClose,
  signature,
}) => {
  if (isLoading || !previewData)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <p className="text-white text-lg font-semibold animate-pulse">
          {isLoading ? "Loading Preview..." : "No preview data available."}
        </p>
      </div>
    );

  const formatDate = (date) => convertTimestamp(date) || "__________";
  const docName = previewData?.doctorName || "Dr. Name";
  const docEmail = previewData?.doctorEmail || "email@example.com";
  const docPhone = previewData?.phoneNumber || "000-000-0000";
  const docPractice = previewData?.practiceNumber || "PRAC123456";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4 mt-8">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl shadow-2xl relative border border-gray-300"
      >
        <button
          onClick={onClose}
          className="absolute right-4 text-gray-500 hover:text-[#03045e] text-3xl font-bold"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-5 mt-3 border-gray-300">
          <div className="w-20 h-20 rounded-full bg-[#caf0f8] text-[#03045e] font-semibold flex items-center justify-center text-sm shadow-inner">
            LOGO
          </div>
          <p className="italic text-gray-700">{docPractice}</p>
          <div className="text-right text-sm text-gray-600">
            <p className="text-xl font-bold text-[#03045e]">{docName}</p>
            <p>{docEmail}</p>
            <p>{docPhone}</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Patient Name:
          </label>
          <p className="text-lg font-semibold italic text-gray-900">
            {previewData?.patientName || "N/A"}
          </p>
        </div>

        {/* Preview Body */}
        <div className="text-gray-800 font-serif text-[16px] sm:text-[17px] leading-relaxed text-justify">
          {/* Sick Note */}
          {noteType === "sickNotes" && (
            <>
              <h2 className="text-2xl font-bold text-center text-[#061339] underline mb-4">
                Sick Note
              </h2>

              <p className="text-right mb-4">
                Date: <span>{formatDate(previewData.content?.startDate)}</span>
              </p>

              <p className="mb-2">To Whom It May Concern,</p>
              <p className="mb-2">
                This letter serves as an official medical excuse for:
              </p>

              <p className="text-center font-mono border-b border-gray-400 py-1 mb-2">
                {previewData?.patientName || "___________"}
              </p>

              <p className="mb-2">
                due to a medical condition that required rest and/or treatment.
              </p>

              {/* Reason for Sick Leave */}
              {previewData.content?.reason && (
                <p className="mb-4 italic text-gray-700">
                  <span className="font-semibold text-gray-900">Reason:</span>{" "}
                  {previewData.content.reason}
                </p>
              )}

              <div className="flex justify-center gap-6 my-4 text-center">
                <div>
                  <p className="font-mono border-b border-gray-400 inline-block min-w-[120px] py-1">
                    {formatDate(previewData.content?.startDate)}
                  </p>
                  <p className="text-xs mt-1 text-gray-500">Start Date</p>
                </div>
                <div>
                  <p className="font-mono border-b border-gray-400 inline-block min-w-[120px] py-1">
                    {formatDate(previewData.content?.endDate)}
                  </p>
                  <p className="text-xs mt-1 text-gray-500">End Date</p>
                </div>
              </div>

              <p className="mb-6">
                If further accommodations or verification are required, please
                contact my office.
              </p>

              <p className="font-semibold">Sincerely,</p>
              <p className="border-b border-gray-500 inline-block min-w-[250px] py-1">
                {docName}
              </p>
            </>
          )}

          {/* Prescription */}
          {noteType === "prescriptions" && (
            <div className="relative">
              <h2 className="text-2xl font-bold text-center text-[#03045e] mb-6 underline">
                Prescription Note
              </h2>
              <div className="absolute inset-0 flex justify-center items-center opacity-10 text-[10rem] text-[#03045e] pointer-events-none">
                ℞
              </div>
              <div className="relative bg-gray-50 p-6 rounded-xl border border-gray-300 space-y-5 z-10">
                <p>
                  <span className="font-semibold">Date Issued:</span>{" "}
                  {formatDate(previewData.content?.date)}
                </p>
                <div>
                  <p className="font-semibold mb-1">
                    Prescribed Medication(s):
                  </p>
                  {previewData.content?.medications ? (
                    <ul className="list-disc pl-5">
                      {Object.entries(previewData.content.medications).map(
                        ([_, value], i) => (
                          <li key={i}>{value}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">
                      No medications listed
                    </p>
                  )}
                </div>
                <p>
                  <span className="font-semibold">Instructions:</span>{" "}
                  {previewData.content?.instructions || (
                    <span className="italic text-gray-500">
                      No instructions provided.
                    </span>
                  )}
                </p>
                <div className="flex justify-between mt-10">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-[#03045e]">
                      Dr. {docName}
                    </p>
                    <p>Practice No: {docPractice}</p>
                    <p>{docEmail}</p>
                    <p>{docPhone}</p>
                  </div>
                  <div className="text-right mt-2">
                    <div className="border-b border-gray-600 w-48 h-8"></div>
                    <p className="text-xs italic text-gray-500 mt-1">
                      Dr. {docName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Notes */}
          {noteType === "generalNotes" && (
            <>
              <h2 className="text-2xl font-bold text-center text-[#03045e] underline mb-6">
                Patient Medical Report
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 border border-gray-300 p-4 rounded-xl mb-6">
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="text-base font-medium">
                    {previewData.patientName || "________________________"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Created</p>
                  <p className="text-base font-medium">
                    {formatDate(previewData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="text-base font-medium">Dr. {docName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Practice Number</p>
                  <p className="text-base font-medium">{docPractice}</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl whitespace-pre-line text-base">
                <h3 className="text-lg font-semibold text-[#023e8a] mb-2">
                  Doctor's Notes:
                </h3>
                <p>{previewData.content?.note || previewData.content}</p>
              </div>
              <div className="mt-10 text-right">
                <p className="italic text-gray-500 text-sm">Signed:</p>
                <div className="border-b border-gray-600 w-48 h-8">
                  {signature && (
                    <img
                      src={signature}
                      alt="Doctor signature"
                      className="mb-2 border max-w-xs"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Dr. {docName}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
