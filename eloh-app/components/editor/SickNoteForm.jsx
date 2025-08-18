"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
import NotePreview from "./NotePreview";
import MessageBanner from "../MessageBanner";

const SickNoteForm = ({ patientData, doctorId, mode, patientId }) => {
  const {
    handleSaveNote,
    error,
    resetError,
    resetSuccess,
    submitting,
    successMessage,
  } = useSaveMedicalHistory();

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewData, setPreviewData] = useState(null);

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
  };

  const handleSubmit = async () => {
    resetError();
    resetSuccess();

    const errors = {};
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (!reason.trim()) errors.reason = "Reason is required.";
    if (!signature) errors.signature = "Doctor's signature is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const noteContent = { startDate, endDate, reason: reason.trim() };

    const { success } = await handleSaveNote({
      mode,
      noteContent,
      patientId,
      roomID: doctorId,
    });

    if (success) setShowPreview(true);
  };

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/get-latest-note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    <div className="p-6 bg-white rounded-lg text-black space-y-6 shadow-md w-full max-w-2xl mx-auto">
      {openPreview && (
        <NotePreview
          previewData={previewData}
          noteType="sickNotes"
          isLoading={false}
          onClose={() => setOpenPreview(false)}
          signature={signature}
          patientId={patientId}
        />
      )}

      <h2 className="text-xl font-semibold text-[#03045e]">Sick Note</h2>
      <p>
        <strong>Patient Name:</strong> {patientData?.fullName}
      </p>

      <div className="bg-gray-100 p-4 rounded-md border border-gray-300 space-y-4">
        <div>
          <label className="block mb-1 font-semibold" htmlFor="start-date">
            Start Date:
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            title="Select the first day the patient will be absent"
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md px-3 py-2 w-full border border-gray-300 cursor-pointer"
          />
          {fieldErrors.startDate && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold" htmlFor="end-date">
            End Date:
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            title="Select the last day the patient will be absent"
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md px-3 py-2 w-full border border-gray-300 cursor-pointer"
          />
          {fieldErrors.endDate && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="reason">
          Reason for Absence:
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          title="Write a brief explanation of the patient's medical condition"
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md px-3 py-2 resize-none border border-gray-300"
          placeholder="Enter reason for absence"
        />
        {fieldErrors.reason && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.reason}</p>
        )}
      </div>

      <p>
        <strong>Recommended Rest Period:</strong> {startDate || "---"} to{" "}
        {endDate || "---"}
      </p>

      <div>
        <p className="font-semibold mb-2">Doctor’s Signature</p>
        {signature ? (
          <>
            <img
              src={signature}
              alt="Doctor signature"
              className="mb-2 border max-w-xs"
            />
            <button
              title="Remove current signature"
              onClick={() => setSignature(null)}
              className="bg-red-600 text-white py-2 px-4 text-sm rounded shadow-[0_4px_#999] active:shadow-[0_2px_#666] hover:bg-red-700 transition"
            >
              Remove Signature
            </button>
          </>
        ) : (
          showSignaturePad && (
            <SignaturePad
              onSave={handleSignatureSave}
              onCancel={() => setShowSignaturePad(false)}
            />
          )
        )}
        {fieldErrors.signature && (
          <p className="text-sm text-red-600 mt-2">{fieldErrors.signature}</p>
        )}
      </div>

      {error && <MessageBanner type="error" message={error} />}
      {successMessage && (
        <MessageBanner type="success" message={successMessage} />
      )}

      {/* Buttons container for submit and preview */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
        {!signature && !showSignaturePad && (
          <button
            title="Open signature pad to sign the note"
            onClick={() => setShowSignaturePad(true)}
            className="bg-[#03045e] text-white py-3 px-5 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
          >
            Sign Here
          </button>
        )}

        <button
          title="Submit this sick note to save"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#03045e] text-white py-3 px-5 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

        {showPreview && (
          <button
            title="Preview your completed note"
            onClick={handlePreview}
            disabled={isLoading}
            className="bg-[#03045e] text-white py-3 px-5 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
          >
            Preview
          </button>
        )}
      </div>
    </div>
  );
};

export default SickNoteForm;
