"use client";

import {
  dietOptions,
  exerciseOptions,
  hobbiesOptions,
  livingSituationOptions,
} from "@/constants/socialOptions";

const Step3SocialHistory = ({ formData, setFormData, errors }) => {
  const { socialHistory } = formData;

  const handleCheckboxChange = (field, value) => {
    const currentArray = socialHistory[field] || [];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        socialHistory: {
          ...socialHistory,
          [field]: currentArray.filter((v) => v !== value),
        },
      });
    } else {
      setFormData({
        ...formData,
        socialHistory: {
          ...socialHistory,
          [field]: [...currentArray, value],
        },
      });
    }
  };

  const handleOtherChange = (field, value) => {
    setFormData({
      ...formData,
      socialHistory: {
        ...socialHistory,
        [`other${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
      },
    });
  };

  const renderArrayOptions = (field, options) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={socialHistory[field]?.includes(option) || false}
            onChange={() => handleCheckboxChange(field, option)}
            className="w-5 h-5"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}

      {socialHistory[field]?.includes("Other") && (
        <>
          <input
            type="text"
            placeholder="Please specify"
            value={
              socialHistory[
                `other${field.charAt(0).toUpperCase() + field.slice(1)}`
              ] || ""
            }
            onChange={(e) => handleOtherChange(field, e.target.value)}
            className="mt-2 w-full border border-gray-300 rounded-lg text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {errors[`other${field.charAt(0).toUpperCase() + field.slice(1)}`] && (
            <p className="text-sm text-red-600 mt-1">
              {errors[`other${field.charAt(0).toUpperCase() + field.slice(1)}`]}
            </p>
          )}
        </>
      )}

      {errors[field] && (
        <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 space-y-6">
      <h2 className="text-xl font-semibold text-blue-800">Social History</h2>
      <p className="text-sm text-gray-500">
        Please select your lifestyle and habits. You may choose more than one.
      </p>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Smoking</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["Never", "Former", "Current", "Other"].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name="smoking"
                checked={socialHistory.smoking.status === option}
                onChange={() =>
                  setFormData({
                    ...formData,
                    socialHistory: {
                      ...socialHistory,
                      smoking: { ...socialHistory.smoking, status: option },
                    },
                  })
                }
                className="w-5 h-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {socialHistory.smoking.status === "Other" && (
            <input
              type="text"
              placeholder="Please specify"
              value={socialHistory.smoking.packYears}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialHistory: {
                    ...socialHistory,
                    smoking: {
                      ...socialHistory.smoking,
                      packYears: e.target.value,
                    },
                  },
                })
              }
              className="mt-2 w-full border border-gray-300 rounded-lg text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Alcohol</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["None", "Occasionally", "Regularly", "Other"].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name="alcohol"
                checked={socialHistory.alcohol.type === option}
                onChange={() =>
                  setFormData({
                    ...formData,
                    socialHistory: {
                      ...socialHistory,
                      alcohol: { ...socialHistory.alcohol, type: option },
                    },
                  })
                }
                className="w-5 h-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {socialHistory.alcohol.type === "Other" && (
            <input
              type="text"
              placeholder="Please specify"
              value={socialHistory.alcohol.frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialHistory: {
                    ...socialHistory,
                    alcohol: {
                      ...socialHistory.alcohol,
                      frequency: e.target.value,
                    },
                  },
                })
              }
              className="mt-2 w-full border border-gray-300 rounded-lg text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Drugs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["None", "Occasionally", "Regularly", "Other"].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name="drugs"
                checked={socialHistory.drugs.type === option}
                onChange={() =>
                  setFormData({
                    ...formData,
                    socialHistory: {
                      ...socialHistory,
                      drugs: { ...socialHistory.drugs, type: option },
                    },
                  })
                }
                className="w-5 h-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {socialHistory.drugs.type === "Other" && (
            <input
              type="text"
              placeholder="Please specify"
              value={socialHistory.drugs.frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialHistory: {
                    ...socialHistory,
                    drugs: {
                      ...socialHistory.drugs,
                      frequency: e.target.value,
                    },
                  },
                })
              }
              className="mt-2 w-full border border-gray-300 rounded-lg text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Diet</h3>
        {renderArrayOptions("diet", dietOptions)}
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Exercise</h3>
        {renderArrayOptions("exercise", exerciseOptions)}
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">Hobbies</h3>
        {renderArrayOptions("hobbies", hobbiesOptions)}
      </div>

      <div>
        <h3 className="text-md font-medium text-blue-700 mb-2">
          Living Situation
        </h3>
        {renderArrayOptions("livingSituation", livingSituationOptions)}
      </div>
    </div>
  );
};

export default Step3SocialHistory;
