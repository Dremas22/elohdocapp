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
    <div className="grid grid-cols-1 gap-6">
      <input
        type="text"
        placeholder="Medications (comma-separated)"
        value={allergies.medications.join(", ")}
        onChange={(e) => updateAllergy("medications", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.allergies ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Food Allergies"
        value={allergies.food.join(", ")}
        onChange={(e) => updateAllergy("food", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.allergies ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Environmental Allergies"
        value={allergies.environmental.join(", ")}
        onChange={(e) => updateAllergy("environmental", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.allergies ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      <input
        type="text"
        placeholder="Other Allergies"
        value={allergies.other.join(", ")}
        onChange={(e) => updateAllergy("other", e.target.value)}
        className={`w-full px-4 py-3 rounded-md border ${
          errors.allergies ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      {errors.allergies && (
        <p className="text-sm text-red-600 mt-1">{errors.allergies}</p>
      )}
    </div>
  );
};

export default Step4Allergies;
