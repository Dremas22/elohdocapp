import { medicalOptions } from "@/constants/socialOptions";

const Step5MedicalHistory = ({ formData, setFormData, errors }) => {
  const { medicalHistory } = formData;

  const handleCheckboxChange = (field, value) => {
    const current = medicalHistory[field] || [];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        medicalHistory: {
          ...medicalHistory,
          [field]: current.filter((v) => v !== value),
        },
      });
    } else {
      setFormData({
        ...formData,
        medicalHistory: {
          ...medicalHistory,
          [field]: [...current, value],
        },
      });
    }
  };

  const handleOtherChange = (field, value) => {
    setFormData({
      ...formData,
      medicalHistory: {
        ...medicalHistory,
        [`other${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
      },
    });
  };

  const renderCheckboxes = (field) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {medicalOptions[field].map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={medicalHistory[field]?.includes(option)}
            onChange={() => handleCheckboxChange(field, option)}
            className="w-5 h-5"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}

      {medicalHistory[field]?.includes("Other") && (
        <input
          type="text"
          placeholder="Please specify"
          value={
            medicalHistory[
              `other${field.charAt(0).toUpperCase() + field.slice(1)}`
            ] || ""
          }
          onChange={(e) => handleOtherChange(field, e.target.value)}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      )}

      {errors[field] && (
        <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
      )}
      {medicalHistory[field]?.includes("Other") &&
        errors[`other${field.charAt(0).toUpperCase() + field.slice(1)}`] && (
          <p className="text-sm text-red-600 mt-1">
            {errors[`other${field.charAt(0).toUpperCase() + field.slice(1)}`]}
          </p>
        )}
    </div>
  );

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm space-y-6">
      <h3 className="text-xl font-semibold text-blue-800">Medical History</h3>
      <p className="text-sm text-gray-600">
        Please select your medical history. You may choose more than one.
      </p>

      {Object.keys(medicalOptions).map((field) => (
        <div key={field}>
          <h4 className="text-md font-medium text-blue-700 mb-2">
            {field.replace(/([A-Z])/g, " $1")}
          </h4>
          {renderCheckboxes(field)}
        </div>
      ))}
    </div>
  );
};

export default Step5MedicalHistory;
