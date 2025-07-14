"use client";

const NotePreview = ({ previewData, noteType, isLoading }) => {
  if (isLoading) {
    return <p>Loading Preview...</p>;
  }
  if (!previewData) {
    return <p className="text-gray-400">No preview data available.</p>;
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-300">
      <h3 className="text-lg font-semibold text-[#03045e] mb-3">
        Note Preview
      </h3>

      {noteType === "sickNotes" && (
        <div className="space-y-2">
          <pre> {JSON.stringify(previewData, null, 2)}</pre>
        </div>
      )}

      {noteType === "prescriptions" && (
        <div className="space-y-2">
          <div className="space-y-2">
            <pre> {JSON.stringify(previewData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotePreview;
