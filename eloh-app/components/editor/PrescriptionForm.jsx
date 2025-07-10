"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";

const PrescriptionForm = ({ patientData }) => {
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
    <div className="p-6 bg-white rounded-lg text-black space-y-6 shadow-md">
      <h2 className="text-xl font-semibold text-[#03045e]">Prescription</h2>
      <p>
        <strong>Patient Name:</strong> {patientData?.fullName}
      </p>
      {/* Container around date and instructions */}
      <div className="bg-gray-100 p-4 rounded-md space-y-4 border border-gray-300">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-black rounded-md border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-black rounded-md border border-gray-300"
          />
        </div>
      </div>

      {/* Signature Section */}
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
              className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
              Remove Signature
            </button>
          </>
        ) : (
          <>
            {!showSignaturePad && (
              <button
                onClick={() => setShowSignaturePad(true)}
                className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
              >
                Sign Here
              </button>
            )}
            {showSignaturePad && <SignaturePad onSave={handleSignatureSave} />}
          </>
        )}
      </div>

      {/* Submit and Preview Buttons Centered */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSubmit}
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
        >
          Submit
        </button>

        <button className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer">
          Preview
        </button>
      </div>
    </div>
  );
};

export default PrescriptionForm;
