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
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
