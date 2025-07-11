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

  return (
    <div className="grid grid-cols-1 gap-6">
      <input
        type="text"
        placeholder="Childhood Illnesses"
        value={medicalHistory.childhoodIllnesses.join(", ")}
        onChange={(e) => updateHistory("childhoodIllnesses", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.medicalHistory ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Adult Illnesses"
        value={medicalHistory.adultIllnesses.join(", ")}
        onChange={(e) => updateHistory("adultIllnesses", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.medicalHistory ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Surgeries"
        value={medicalHistory.surgeries.join(", ")}
        onChange={(e) => updateHistory("surgeries", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.medicalHistory ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Hospitalizations"
        value={medicalHistory.hospitalizations.join(", ")}
        onChange={(e) => updateHistory("hospitalizations", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.medicalHistory ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Major Injuries"
        value={medicalHistory.majorInjuries.join(", ")}
        onChange={(e) => updateHistory("majorInjuries", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.medicalHistory ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      {errors.medicalHistory && (
        <p className="text-sm text-red-600 mt-1">{errors.medicalHistory}</p>
      )}
    </div>
  );
};

export default Step5MedicalHistory;
