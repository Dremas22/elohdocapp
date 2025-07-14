"use client";

const Step4Allergies = ({ formData, setFormData, errors }) => {
  const { allergies } = formData;
  const updateAllergy = (type, value) => {
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        [type]: value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    });
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
      <h3 className="text-xl font-semibold text-blue-800 mb-4">Allergies</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please list any allergies you have. Separate multiple entries with commas.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {[
          { key: "medications", label: "Medications" },
          { key: "food", label: "Food Allergies" },
          { key: "environmental", label: "Environmental Allergies" },
          { key: "other", label: "Other Allergies" },
        ].map(({ key, label }) => (
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
              value={allergies[key].join(", ")}
              onChange={(e) => updateAllergy(key, e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.allergies ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
          </div>
        ))}
      </div>

      {errors.allergies && (
        <p className="text-sm text-red-600 mt-3">{errors.allergies}</p>
      )}
    </div>
  );
};

export default Step4Allergies;
