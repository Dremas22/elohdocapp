"use client";

const PatientDisplay = ({ patients }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded text-sm text-gray-800 overflow-auto whitespace-pre-wrap border border-gray-200 shadow-sm max-h-96">
      {JSON.stringify(patients, null, 2)}
    </pre>
  );
};

export default PatientDisplay;
