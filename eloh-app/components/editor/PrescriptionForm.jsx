"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
import NotePreview from "./NotePreview";
import MessageBanner from "../MessageBanner";

const PrescriptionForm = ({ patientData, doctorId, mode, patientId }) => {
  const {
    handleSaveNote,
    error,
    submitting,
    successMessage,
    resetError,
    resetSuccess,
  } = useSaveMedicalHistory();

  const [signature, setSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
  };

  const handleMedicationChange = (index, value) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const handleAddMedication = () => {
    setMedications([...medications, ""]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    resetError();
    resetSuccess();
    setFieldErrors({});

    const errors = {};
    const trimmedMedications = medications
      .map((m) => m.trim())
      .filter((m) => m);

    if (!date) errors.date = "Please select a date.";
    if (!instructions.trim())
      errors.instructions = "Instructions are required.";
    if (trimmedMedications.length === 0)
      errors.medications = "At least one medication is required.";
    if (!signature) errors.signature = "Doctor's signature is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const noteContent = {
      date,
      instructions: instructions.trim(),
      medications: trimmedMedications,
    };

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
          body: JSON.stringify({ patientId, noteType: "prescriptions" }),
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
    <div className="p-4 sm:p-6 bg-white rounded-lg text-black space-y-6 shadow-md max-w-full sm:max-w-2xl mx-auto">
      {openPreview && (
        <NotePreview
          previewData={previewData}
          noteType="prescriptions"
          isLoading={isLoading}
          onClose={() => setOpenPreview(false)}
          signature={signature}
          patientId={patientId}
        />
      )}

      <h2 className="text-lg sm:text-xl font-semibold text-[#03045e]">
        Prescription
      </h2>
      <p className="text-sm sm:text-base">
        <strong>Patient Name:</strong> {patientData?.fullName}
      </p>

      <div className="bg-gray-100 p-4 rounded-md space-y-4 border border-gray-300">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            title="Select the prescription date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 text-black rounded-md border cursor-pointer ${
              fieldErrors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.date && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medications
          </label>
          <div className="space-y-2">
            {medications.map((med, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  title={`Enter medication ${index + 1}`}
                  type="text"
                  value={med}
                  onChange={(e) =>
                    handleMedicationChange(index, e.target.value)
                  }
                  className="flex-grow sm:px-3 px-0.5 py-2 text-black rounded-md border border-gray-300"
                  placeholder="e.g. Amoxicillin 500mg"
                />
                <button
                  title="Remove this medication"
                  type="button"
                  onClick={() => handleRemoveMedication(index)}
                  className="text-red-600 font-bold text-xl leading-none px-3 py-1 -ml-11 cursor-pointer"
                  aria-label={`Remove medication ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {fieldErrors.medications && (
            <p className="text-red-600 text-xs mt-1 mb-2">
              {fieldErrors.medications}
            </p>
          )}
          <button
            title="Add a new medication field"
            type="button"
            onClick={handleAddMedication}
            className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
          >
            + Add Medication
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            title="Enter instructions for the prescribed medications"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 text-black rounded-md border resize-y min-h-[80px] ${
              fieldErrors.instructions ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.instructions && (
            <p className="text-red-600 text-xs mt-1">
              {fieldErrors.instructions}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {!signature && !showSignaturePad && (
          <button
            title="Open signature pad to sign this prescription"
            onClick={() => setShowSignaturePad(true)}
            className="bg-[#03045e] text-white py-3 px-4 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition cursor-pointer"
            style={{ minWidth: "120px" }}
          >
            Sign Here
          </button>
        )}
      </div>

      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}

      {signature && (
        <div className="mt-4">
          <img
            src={signature}
            alt="Doctor signature"
            className="mb-2 border max-w-full sm:max-w-xs"
          />
          <button
            title="Remove signature and sign again"
            onClick={() => setSignature(null)}
            className="bg-red-600 text-white py-2 px-4 text-sm rounded-lg shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-red-700 transition w-full sm:w-auto cursor-pointer"
          >
            Remove Signature
          </button>
        </div>
      )}
      {fieldErrors.signature && (
        <p className="text-red-600 text-xs mt-2">{fieldErrors.signature}</p>
      )}

      {/* Buttons container */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
        <button
          title="Submit and save prescription"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#03045e] text-white py-3 px-4 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition cursor-pointer"
          style={{ minWidth: "120px" }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

        {showPreview && (
          <button
            title="View submitted prescription preview"
            onClick={handlePreview}
            disabled={isLoading}
            className="bg-[#03045e] text-white py-3 px-4 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition cursor-pointer ml-auto"
            style={{ minWidth: "120px" }}
          >
            {isLoading ? "Loading Preview..." : "Preview"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PrescriptionForm;
