"use client";
import { convertTimestamp } from "@/lib/convertFirebaseDate";
import { FaHeartbeat } from "react-icons/fa";

/**
 * NotePreview Component
 *
 * Displays a preview of different types of medical notes for patients,
 * such as sick notes, prescription notes, and general medical reports.
 * Supports loading states and shows doctor and patient information.
 *
 * @param {Object} props - Component props
 * @param {Object} props.previewData - The data object containing note details and metadata
 * @param {("sickNotes"|"prescriptions"|"generalNotes")} props.noteType - The type of note to display
 * @param {boolean} props.isLoading - Whether the note data is loading
 * @param {Function} props.onClose - Callback to close the preview modal
 * @param {string} [props.signature] - Optional URL of doctor's signature image
 *
 * @returns {JSX.Element} The rendered NotePreview component
 */
const NotePreview = ({
  previewData,
  noteType,
  isLoading,
  onClose,
  signature,
}) => {
  // Show loading or no-data message while loading or if previewData is not provided
  const previewRef = useRef(null);
  if (isLoading || !previewData)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
        <p className="text-white text-base sm:text-lg font-semibold animate-pulse text-center">
          {isLoading ? "Loading Preview..." : "No preview data available."}
        </p>
      </div>
    );

  /**
   * Formats a Firebase Timestamp to a human-readable date string.
   * Falls back to a placeholder if no date is provided.
   *
   * @param {any} date - Firebase Timestamp or Date object
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => convertTimestamp(date) || "__________";

  // Extract doctor info with fallbacks
  const docName = previewData?.doctorName || "Dr. Name";
  const docEmail = previewData?.doctorEmail || "email@example.com";
  const docPhone = previewData?.phoneNumber || "000-000-0000";
  const docPractice = previewData?.practiceNumber || "PRAC123456";

  /**
   * Renders the "Powered by Elodoc" watermark at specified position.
   *
   * @param {Object} props - Component props
   * @param {("left"|"right"|"center")} [props.position="center"] - Position of the watermark
   * @returns {JSX.Element}
   */
  const ElodocWatermark = ({ position = "center" }) => {
    const baseClasses =
      "absolute z-0 pointer-events-none select-none opacity-20 text-xs scale-[0.7] sm:scale-100 sm:text-sm font-semibold text-[#022d35] flex items-center gap-1";
    const positions = {
      right: "bottom-4 right-4",
      left: "bottom-4 left-4",
      center: "bottom-4 left-1/2 transform -translate-x-1/2",
    };

    const placement = positions[position] || positions.center;

    return (
      <div className={`${baseClasses} ${placement}`}>
        <span>
          Powered by <span className="font-bold">Elodoc</span>
        </span>
        <FaHeartbeat className="text-[#0077b6] text-sm sm:text-lg animate-pulse-fast" />
      </div>
    );
  };

  const handleDownload = async () => {
    if (!previewRef.current) {
      toast.error("Could not download preview");
      return;
    }

    // Fix OKLCH → RGB
    convertOKLCHtoRGB(previewRef.current);

    try {
      const canvas = await html2canvas(previewRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: "a4",
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${noteType}_${Date.now()}.pdf`);
      toast.success("Preview downloaded successfully");
    } catch (error) {
      console.log(error, "DOWNLOAD ERROR");
      toast.error("Could not download preview");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-preview-title"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white mt-17 p-5 sm:p-8 rounded-2xl shadow-xl relative border border-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-0.5 right-2 text-gray-400 hover:text-[#023e8a] text-3xl font-bold"
        >
          &times;
        </button>
        <div ref={previewRef}>
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
        <div className="text-gray-800 font-serif text-[15px] sm:text-[16px] leading-relaxed text-justify space-y-8">
          {/* Sick Note */}
          {noteType === "sickNotes" && (
            <div className="relative bg-white p-4 sm:p-6 rounded-xl border border-gray-300">
              <div className="relative z-10 space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-[#023e8a]">
                  Sick Note
                </h2>
                <p className="text-right text-sm">
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
                <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-10 text-center">
                  <div>
                    <p className="font-mono border-b border-gray-400 inline-block min-w-[100px] py-1">
                      {formatDate(previewData.content?.startDate)}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">Start Date</p>
                  </div>
                  <div>
                    <p className="font-mono border-b border-gray-400 inline-block min-w-[100px] py-1">
                      {formatDate(previewData.content?.endDate)}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">End Date</p>
                  </div>
                </div>
                <p>
                  If further accommodations or verification are required, please contact my office.
                </p>
                <p className="font-semibold mt-6">Sincerely,</p>
                <p className="border-b border-gray-500 inline-block min-w-[200px]">
                  {docName}
                </p>
              </div>
              <ElodocWatermark position="right" />
            </div>
          )}

          {/* Prescription Note */}
          {noteType === "prescriptions" && (
            <div className="relative bg-white p-4 sm:p-6 rounded-xl border border-gray-300">
              {/* Rx Logo Watermark */}
              <div className="absolute inset-0 flex justify-center items-center z-0 pointer-events-none select-none">
                <span className="text-[10rem] sm:text-[16rem] text-[#16292d] font-serif opacity-10 pt-10">
                  ℞
                </span>
              </div>
              <div className="relative z-10 space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-[#023e8a]">
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
            <div className="relative bg-white p-4 sm:p-6 rounded-xl border border-gray-300">
              <div className="relative z-10 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-[#023e8a]">
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
                <div className="bg-white border border-gray-200 p-4 rounded-xl whitespace-pre-line text-sm sm:text-base">
                  <h3 className="text-base sm:text-lg font-semibold text-[#023e8a] mb-2">
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
              </div>
              <br />
              <ElodocWatermark />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
