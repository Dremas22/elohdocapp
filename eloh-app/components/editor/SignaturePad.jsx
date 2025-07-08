"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

const SignaturePad = ({ onSave, onCancel }) => {
  const sigRef = useRef(null);

  const handleClear = () => sigRef.current?.clear();

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL(); // base64 image
      onSave(dataUrl);
    } else {
      alert("Please provide a signature before saving.");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white space-y-4">
      <h3 className="text-lg font-semibold">Draw Your Signature</h3>
      <div className="bg-white p-2 rounded">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 150,
            className: "rounded bg-white",
          }}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleClear}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
