"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
import NotePreview from "./NotePreview";

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
  const [date, setDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
    console.log("Saved signature:", dataUrl);
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
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleSubmit = async () => {
    resetError();
    resetSuccess();
    setFieldErrors({});

    const errors = {};
    const trimmedMedications = medications.map((m) => m.trim()).filter((m) => m);

    if (!date) errors.date = "Please select a date.";
    if (!instructions.trim()) errors.instructions = "Instructions are required.";
    if (trimmedMedications.length === 0) errors.medications = "At least one medication is required.";
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

    if (success) {
      setShowPreview(true);
    }
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
    <div className="p-6 bg-white rounded-lg text-black space-y-6 shadow-md">
      {openPreview && (
        <NotePreview
          previewData={previewData}
          noteType="prescriptions"
          isLoading={isLoading}
          onClose={() => setOpenPreview(false)}
        />
      )}
      <h2 className="text-xl font-semibold text-[#03045e]">Prescription</h2>

      <p>
        <strong>Patient Name:</strong> {patientData?.fullName}
      </p>

      <div className="bg-gray-100 p-4 rounded-md space-y-4 border border-gray-300">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 text-black rounded-md border ${fieldErrors.date ? "border-red-500" : "border-gray-300"
              }`}
          />
          {fieldErrors.date && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.date}</p>
          )}
        </div>

        {/* Medications - moved above instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
          {medications.map((med, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={med}
                onChange={(e) => handleMedicationChange(index, e.target.value)}
                className="flex-grow px-3 py-2 text-black rounded-md border border-gray-300"
                placeholder="e.g. Amoxicillin 500mg"
              />
              <button
                type="button"
                onClick={() => handleRemoveMedication(index)}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          {fieldErrors.medications && (
            <p className="text-red-600 text-xs mb-2">
              {fieldErrors.medications}
            </p>
          )}
          <button
            type="button"
            onClick={handleAddMedication}
            className="text-blue-600 text-sm font-medium"
          >
            + Add Medication
          </button>
        </div>

        {/* Instructions - moved below medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 text-black rounded-md border ${fieldErrors.instructions ? "border-red-500" : "border-gray-300"
              }`}
          />
          {fieldErrors.instructions && (
            <p className="text-red-600 text-xs mt-1">
              {fieldErrors.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Signature */}
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
              onClick={() => setSignature(null)}
              className="bg-red-600 text-white py-2 px-4 text-sm rounded shadow hover:bg-red-700 transition"
            >
              Remove Signature
            </button>
          </>
        ) : (
          <>
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
        {fieldErrors.signature && (
          <p className="text-red-600 text-xs mt-2">{fieldErrors.signature}</p>
        )}
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="text-red-600 text-sm font-semibold">{error}</div>
      )}
      {successMessage && (
        <div className="text-green-700 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      {/* Submit & Preview */}
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

export default PrescriptionForm;
