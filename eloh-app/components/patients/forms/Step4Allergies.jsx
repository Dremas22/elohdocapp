"use client";

const allergyOptions = {
  medications: [
    "Penicillin",
    "Aspirin",
    "Ibuprofen",
    "Sulfa drugs",
    "Morphine / Opioids",
    "Antibiotic",
  ],
  food: [
    "Peanuts",
    "Tree nuts",
    "Shellfish",
    "Fish",
    "Dairy",
    "Eggs",
    "Wheat / Gluten",
    "Soy",
  ],
  environmental: [
    "Pollen",
    "Dust mites",
    "Mold",
    "Pet dander",
    "Insect stings",
    "Grass",
  ],
};

const Step4Allergies = ({ formData, setFormData, errors }) => {
  const { allergies } = formData;

  const handleCheckboxChange = (type, value) => {
    const current = allergies[type] || [];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        allergies: {
          ...allergies,
          [type]: current.filter((v) => v !== value),
        },
      });
    } else {
      setFormData({
        ...formData,
        allergies: {
          ...allergies,
          [type]: [...current, value],
        },
      });
    }
  };

  const handleOtherCheckbox = () => {
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        other: {
          ...allergies.other,
          isChecked: !allergies.other.isChecked,
        },
      },
    });
  };

  const handleOtherTextChange = (text) => {
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        other: {
          ...allergies.other,
          text,
        },
      },
    });
  };

  const renderCheckboxes = (type) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {allergyOptions[type].map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allergies[type]?.includes(option)}
            onChange={() => handleCheckboxChange(type, option)}
            className="w-5 h-5"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}

      {/* Other option */}
      <label className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={allergies.other.isChecked}
          onChange={handleOtherCheckbox}
          className="w-5 h-5"
        />
        <span className="text-gray-700">Other</span>
      </label>

      {allergies.other?.isChecked && (
        <input
          type="text"
          placeholder="Please specify"
          value={allergies.other?.text}
          onChange={(e) => handleOtherTextChange(e.target.value)}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      )}

      {/* Errors */}
      {errors[type] && (
        <p className="text-sm text-red-600 mt-1">{errors[type]}</p>
      )}
      {allergies.other.isChecked && errors.otherText && (
        <p className="text-sm text-red-600 mt-1">{errors.otherText}</p>
      )}
    </div>
  );

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm space-y-6">
      <h3 className="text-xl font-semibold text-blue-800">Allergies</h3>
      <p className="text-sm text-gray-600 mb-4">
        Please select any allergies you have. You may choose more than one.
      </p>

      <div>
        <h4 className="text-md font-medium text-blue-700 mb-2">Medications</h4>
        {renderCheckboxes("medications")}
      </div>

      <div>
        <h4 className="text-md font-medium text-blue-700 mb-2">
          Food Allergies
        </h4>
        {renderCheckboxes("food")}
      </div>

      <div>
        <h4 className="text-md font-medium text-blue-700 mb-2">
          Environmental Allergies
        </h4>
        {renderCheckboxes("environmental")}
      </div>
    </div>
  );
};

export default Step4Allergies;
