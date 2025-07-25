"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
import NotePreview from "./NotePreview";

/**
 * SickNoteForm Component
 * 
 * Renders a form for doctors to create and submit a sick note for a patient.
 * Includes validation, signature capture, and preview functionality.
 */
const SickNoteForm = ({ patientData, doctorId, mode, patientId }) => {
  // Custom hook to manage save logic and state
  const {
    handleSaveNote,
    error,
    resetError,
    resetSuccess,
    submitting,
    successMessage,
  } = useSaveMedicalHistory();

  // Form state
  const [startDate, setStartDate] = useState(new Date().toDateString());
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);

  // UI control states
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Save signature data from SignaturePad
  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
  };

  // Form submission handler
  const handleSubmit = async () => {
    resetError();
    resetSuccess();

    const errors = {};

    // Basic validation
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (!reason.trim()) errors.reason = "Reason is required.";
    if (!signature) errors.signature = "Doctor's signature is required.";

    // If errors exist, block submission and display them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Prepare data to be saved
    const noteContent = {
      startDate,
      endDate,
      reason: reason.trim(),
    };

    // Call the save handler
    const { success } = await handleSaveNote({
      mode,
      noteContent,
      patientId,
      roomID: doctorId,
    });

    // Show preview button only if successful
    if (success) setShowPreview(true);
  };

  // Preview sick note from server
  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/get-latest-note`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patientId, noteType: "sickNotes" }),
        }
      );

      const data = await response.json();
      setPreviewData(data?.note);
      setOpenPreview(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg text-black space-y-6 shadow-md">
      {/* Show Preview Modal */}
      {openPreview && (
        <NotePreview
          previewData={previewData}
          noteType="sickNotes"
          isLoading={isLoading}
        />
      )}

      <h2 className="text-xl font-semibold text-[#03045e]">Sick Note</h2>

      {/* Patient Info */}
      <p>
        <strong>Patient Name:</strong> {patientData?.fullName}
      </p>

      {/* Date Fields */}
      <div className="bg-gray-100 p-4 rounded-md border border-gray-300 space-y-4">
        {/* Start Date */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="start-date">
            Start Date:
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md px-3 py-2 text-black w-full border border-gray-300"
          />
          {fieldErrors.startDate && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.startDate}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="end-date">
            End Date:
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md px-3 py-2 text-black w-full border border-gray-300"
          />
          {fieldErrors.endDate && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.endDate}</p>
          )}
        </div>
      </div>

      {/* Reason for Absence */}
      <div>
        <label className="block mb-1 font-semibold" htmlFor="reason">
          Reason for Absence:
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-black resize-none border border-gray-300"
          placeholder="Enter reason for absence"
        />
        {fieldErrors.reason && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.reason}</p>
        )}
      </div>

      {/* Display summary of rest period */}
      <p>
        <strong>Recommended Rest Period:</strong> {startDate || "---"} to{" "}
        {endDate || "---"}
      </p>

      {/* Signature Section */}
      <div>
        <p className="font-semibold mb-2">Doctor’s Signature</p>

        {/* If signature exists, show image and remove button */}
        {signature ? (
          <>
            <img
              src={signature}
              alt="Doctor signature"
              className="mb-2 border max-w-xs"
            />
            <button
              onClick={() => setSignature(null)}
              className="bg-red-600 text-white py-2 px-4 text-sm rounded shadow hover:bg-red-700 transition"
            >
              Remove Signature
            </button>
          </>
        ) : (
          <>
            {/* Show signature pad if toggled on */}
            {!showSignaturePad && (
              <button
                onClick={() => setShowSignaturePad(true)}
                className="bg-[#03045e] text-white py-2 px-4 text-sm rounded shadow hover:bg-[#023e8a]"
              >
                Sign Here
              </button>
            )}
            {showSignaturePad && <SignaturePad onSave={handleSignatureSave} />}
          </>
        )}

        {/* Signature validation error */}
        {fieldErrors.signature && (
          <p className="text-sm text-red-600 mt-2">{fieldErrors.signature}</p>
        )}
      </div>

      {/* Server response messages */}
      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      {successMessage && (
        <p className="text-sm text-green-700 font-semibold">{successMessage}</p>
      )}

      {/* Submit & Preview Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow active:shadow-md active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

        {showPreview && (
          <button
            onClick={handlePreview}
            className="bg-gray-600 text-white py-3 px-5 text-sm font-semibold rounded-xl shadow hover:bg-gray-700 transition"
          >
            {isLoading ? "Loading Preview..." : "Preview"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SickNoteForm;
