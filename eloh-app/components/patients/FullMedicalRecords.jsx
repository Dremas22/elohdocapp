import ToggleMedicalSection from "./ToggleMedicalSection";

const FullMedicalRecords = ({ medicalHistory, loading }) => {
  if (loading)
    return <p className="text-sm text-gray-500 italic">Loading...</p>;
  if (!medicalHistory) return <p className="text-red-500">No data found.</p>;

  const staticSections = {
    adultIllnesses: "Adult Illnesses",
    childhoodIllnesses: "Childhood Illnesses",
    hospitalizations: "Hospitalizations",
    majorInjuries: "Major Injuries",
    surgeries: "Surgeries",
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Left - Toggle Sections */}
      <div className="w-3/4 h-full overflow-hidden">
        <ToggleMedicalSection medicalHistory={medicalHistory} />
      </div>

      {/* Right - Always visible static sections */}
      <div className="w-1/4 h-full overflow-y-auto pr-2 space-y-4">
        {Object.entries(staticSections).map(([key, title]) => (
          <div
            key={key}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <h3 className="text-base font-semibold text-[#023e8a] mb-2">
              {title}
            </h3>
            {medicalHistory?.[key]?.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-800 text-sm">
                {medicalHistory[key].map((item, index) => (
                  <li key={index}>
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No records found.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FullMedicalRecords;
