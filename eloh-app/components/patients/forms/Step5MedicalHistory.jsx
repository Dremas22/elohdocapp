"use client";

const Step5MedicalHistory = ({ formData, setFormData, errors }) => {
  const { medicalHistory } = formData;
  const updateHistory = (field, value) => {
    setFormData({
      ...formData,
      medicalHistory: {
        ...medicalHistory,
        [field]: value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    });
  };

  const fields = [
    { key: "childhoodIllnesses", label: "Childhood Illnesses" },
    { key: "adultIllnesses", label: "Adult Illnesses" },
    { key: "surgeries", label: "Surgeries" },
    { key: "hospitalizations", label: "Hospitalizations" },
    { key: "majorInjuries", label: "Major Injuries" },
  ];

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
      <h3 className="text-xl font-semibold text-blue-800 mb-4">Medical History</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please list your medical history details. Separate multiple entries with commas.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <label
              htmlFor={key}
              className="mb-1 text-sm font-medium text-blue-700"
            >
              {label}
            </label>
            <input
              id={key}
              type="text"
              placeholder={`${label} (comma-separated)`}
              value={medicalHistory[key].join(", ")}
              onChange={(e) => updateHistory(key, e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.medicalHistory ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
          </div>
        ))}
      </div>

      {errors.medicalHistory && (
        <p className="text-sm text-red-600 mt-4">{errors.medicalHistory}</p>
      )}
    </div>
  );
};

export default Step5MedicalHistory;
