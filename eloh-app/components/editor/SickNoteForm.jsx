"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad"; // your reusable signature component

const SickNoteForm = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setShowSignaturePad(false);
    console.log("Saved signature:", dataUrl);
  };

  const handleSubmit = () => {
    console.log({
      startDate,
      endDate,
      reason,
      signature,
    });
  };

  return (
    <div className="p-4 bg-gray-700 rounded text-white space-y-4">
      <h2 className="text-lg font-semibold mb-4">Sick Note</h2>
      <p>
        <strong>Patient Name:</strong> John Doe
      </p>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="start-date">
          Start Date:
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded px-2 py-1 text-black w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="end-date">
          End Date:
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded px-2 py-1 text-black w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="reason">
          Reason for Absence:
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded px-2 py-1 text-black resize-none"
          placeholder="Enter reason for absence"
        />
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

export default SickNoteForm;
