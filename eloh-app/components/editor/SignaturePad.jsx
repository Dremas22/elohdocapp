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
    <div className="bg-gray-800 p-4 rounded-md text-white space-y-4 w-full max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-center">Draw Your Signature</h3>

      <div className="bg-white p-2 rounded w-full max-w-md mx-auto shadow-md">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 150,
            className: "rounded bg-white w-full h-[150px]",
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
        <button
          title="Clear your current signature"
          onClick={handleClear}
          className="bg-[#03045e] text-white py-3 px-6 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
        >
          Clear
        </button>
        <button
          title="Save this signature"
          onClick={handleSave}
          className="bg-[#03045e] text-white py-3 px-6 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
        >
          Save
        </button>
        <button
          title="Cancel and close the signature pad"
          onClick={onCancel}
          className="bg-[#5e0303] text-white py-3 px-6 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#8a0202] transition-all duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
