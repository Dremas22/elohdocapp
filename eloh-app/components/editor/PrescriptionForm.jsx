"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";

const PrescriptionForm = () => {
  const [signature, setSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const [date, setDate] = useState("");
  const [instructions, setInstructions] = useState("Take with food.");
  const [medications, setMedications] = useState([
    "Amoxicillin 500mg",
    "Ibuprofen 200mg",
  ]);

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
    console.log("Saved signature:", dataUrl);
  };

  const handleSubmit = () => {
    console.log({
      date,
      instructions,
      medications,
      signature,
    });
  };

  return (
    <div className="p-4 bg-gray-700 rounded text-white space-y-4">
      <h2 className="text-lg font-semibold">Prescription</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-2 py-1 text-black rounded"
      />

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={3}
        className="w-full px-2 py-1 text-black rounded"
      />

      {medications.map((med, i) => (
        <input
          key={i}
          value={med}
          onChange={(e) => {
            const newMeds = [...medications];
            newMeds[i] = e.target.value;
            setMedications(newMeds);
          }}
          className="w-full px-2 py-1 text-black rounded mb-2"
        />
      ))}

      <button
        type="button"
        onClick={() => setMedications([...medications, ""])}
        className="bg-green-600 px-3 py-1 rounded"
      >
        Add Medication
      </button>

      <div>
        <p className="font-semibold mb-2">Doctor’s Signature</p>

        {signature ? (
          <>
            <img
              src={signature}
              alt="Doctor signature"
              className="mb-2 border"
            />
            <button
              onClick={() => setSignature(null)}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Remove Signature
            </button>
          </>
        ) : (
          <>
            {!showSignaturePad && (
              <button
                onClick={() => setShowSignaturePad(true)}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Add Signature
              </button>
            )}
            {showSignaturePad && <SignaturePad onSave={handleSignatureSave} />}
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
      >
        Submit
      </button>
    </div>
  );
};

export default PrescriptionForm;
