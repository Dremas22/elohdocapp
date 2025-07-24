"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import { FaHeartbeat } from "react-icons/fa";

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

  const ElodocWatermark = ({ position = "center" }) => {
    const baseClasses =
      "absolute z-0 pointer-events-none select-none opacity-20 text-sm font-semibold text-[#022d35] flex items-center gap-1";

    const positions = {
      right: "bottom-6 right-6",
      left: "bottom-6 left-6",
      center: "bottom-6 left-1/2 transform -translate-x-1/2",
    };

    const placement = positions[position] || positions.center;

    return (
      <div className={`${baseClasses} ${placement}`}>
        <span>Powered by <span className="font-bold">Elodoc</span></span>
        <FaHeartbeat className="text-[#0077b6] text-lg animate-pulse-fast" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4 mt-8">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl shadow-xl relative border border-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#023e8a] text-3xl font-bold"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6 border-gray-200">
          <div>
            <p className="text-base sm:text-lg font-semibold tracking-wide text-[#1b4965] px-3 py-1 rounded-md font-mono inline-block">
              Practice No: {docPractice}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="text-lg font-semibold text-[#023e8a]">{docName}</p>
            <p>{docEmail}</p>
            <p>{docPhone}</p>
          </div>
        </div>


        {/* Main Body */}
        <div className="text-gray-800 font-serif text-[16px] sm:text-[17px] leading-relaxed text-justify space-y-8">
          {/* Sick Note */}
          {noteType === "sickNotes" && (
            <div className="relative bg-white p-6 rounded-xl border border-gray-300 overflow-hidden">
              <div className="relative z-10 space-y-5">
                <h2 className="text-2xl font-bold text-center text-[#023e8a]">
                  Sick Note
                </h2>
                <p className="text-right">
                  Date: <span>{formatDate(previewData.content?.startDate)}</span>
                </p>
                <p>To Whom It May Concern,</p>
                <p>This letter serves as an official medical excuse for:</p>
                <p className="text-center font-mono border-b border-gray-400 py-1">
                  {previewData?.patientName || "___________"}
                </p>
                <p>
                  due to a medical condition that required rest and/or treatment.
                </p>
                {previewData.content?.reason && (
                  <p className="italic text-gray-700">
                    <span className="font-semibold text-gray-900">Reason:</span>{" "}
                    {previewData.content.reason}
                  </p>
                )}
                <div className="flex justify-center gap-10 text-center">
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
                <p>
                  If further accommodations or verification are required, please contact my office.
                </p>
                <p className="font-semibold mt-6">Sincerely,</p>
                <p className="border-b border-gray-500 inline-block min-w-[250px]">
                  {docName}
                </p>
              </div>
              <ElodocWatermark position="right" />

            </div>
          )}

          {/* Prescription Note */}
          {noteType === "prescriptions" && (
            <div className="relative bg-white p-6 rounded-xl border border-gray-300 overflow-hidden">

              {/* Rx Logo Watermark */}
              <div className="absolute inset-0 flex justify-center items-center z-0 pointer-events-none select-none">
                <span className="text-[16rem] text-[#16292d] font-serif opacity-10 pt-10 ml-60">℞</span>
              </div>

              <div className="relative z-10 space-y-5">
                <h2 className="text-2xl font-bold text-center text-[#023e8a]">
                  Prescription Note
                </h2>
                <p>
                  <span className="font-semibold">Date Issued:</span>{" "}
                  {formatDate(previewData.content?.date)}
                </p>
                <div>
                  <p className="font-semibold mb-1">Prescribed Medication(s):</p>
                  {previewData.content?.medications &&
                    Object.values(previewData.content.medications).length > 0 ? (
                    <p className="text-gray-800">
                      {Object.values(previewData.content.medications).join(", ")}
                    </p>
                  ) : (
                    <p className="italic text-gray-500">No medications listed</p>
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
                <div className="text-right pt-6 border-t border-gray-200">
                  <div className="border-b border-gray-600 w-48 h-8 ml-auto"></div>
                  <p className="text-xs italic text-gray-500 mt-1">
                    Dr. {docName}
                  </p>
                </div>
              </div>
              <ElodocWatermark position="left" />

            </div>
          )}

          {/* General Notes */}
          {noteType === "generalNotes" && (
            <div className="relative bg-white p-6 rounded-xl border border-gray-300 overflow-hidden">
              <div className="relative z-10 space-y-6">
                <h2 className="text-2xl font-bold text-center text-[#023e8a]">
                  Patient Medical Report
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 border border-gray-200 p-4 rounded-xl bg-white">
                  <div>
                    <p className="text-sm text-gray-500">Patient Name</p>
                    <p className="font-medium">
                      {previewData.patientName || "________________________"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Created</p>
                    <p className="font-medium">
                      {formatDate(previewData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-medium">Dr. {docName}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl whitespace-pre-line text-base">
                  <h3 className="text-lg font-semibold text-[#023e8a] mb-2">
                    Doctor's Notes:
                  </h3>
                  <p>{previewData.content?.note || previewData.content}</p>
                </div>
                {signature && (
                  <div className="text-right">
                    <img
                      src={signature}
                      alt="Doctor signature"
                      className="max-w-[200px] border rounded-md mb-2"
                    />
                    <div className="border-b border-gray-600 w-48 h-8 ml-auto"></div>
                    <p className="text-xs italic text-gray-500 mt-1">
                      Dr. {docName}
                    </p>
                  </div>
                )}
                <br />
              </div>
              <ElodocWatermark />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
