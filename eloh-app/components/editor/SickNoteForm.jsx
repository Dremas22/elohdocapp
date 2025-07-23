"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";

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
    <div className="p-6 bg-white rounded-lg text-black space-y-6 shadow-md">
      <h2 className="text-xl font-semibold text-[#03045e]">Sick Note</h2>

      <p>
        <strong>Patient Name:</strong> John Doe
      </p>

      {/* Grouped Date Fields */}
      <div className="bg-gray-100 p-4 rounded-md border border-gray-300 space-y-4">
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
            className="rounded-md px-3 py-2 text-black w-full border border-gray-300"
          />
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
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-black resize-none border border-gray-300"
          placeholder="Enter reason for absence"
        />
      </div>

      <p>
        <strong>Recommended Rest Period:</strong>{" "}
        {startDate || "---"} to {endDate || "---"}
      </p>

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
                Add Signature
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

        <button
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default SickNoteForm;
