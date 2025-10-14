"use client";

import { useState } from "react";
import {
  FaSmoking,
  FaHeartbeat,
  FaUtensils,
  FaRunning,
  FaGlassCheers,
  FaHome,
  FaStar,
  FaCannabis,
} from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const groupedSections = [
  {
    title: "Substance Use",
    icon: <FaGlassCheers className="text-yellow-600" />,
    fields: ["usesAlcohol", "alcohol", "isSmoker", "smoking", "usesDrugs", "drugs"],
  },
  {
    title: "Lifestyle & Habits",
    icon: <FaRunning className="text-blue-700" />,
    fields: ["diet", "exercise", "hobbies"],
  },
  {
    title: "Living Situation",
    icon: <FaHome className="text-indigo-600" />,
    fields: ["livingSituation"],
  },
];

const fieldLabels = {
  usesAlcohol: "Do you currently use alcohol?",
  alcohol: "Alcohol Details",
  isSmoker: "Do you currently smoke?",
  smoking: "Smoking Details",
  usesDrugs: "Do you use recreational drugs?",
  drugs: "Drug Details",
  diet: "Dietary Habits",
  exercise: "Exercise Routine",
  hobbies: "Hobbies & Interests",
  livingSituation: "Living Situation",
};

const Step3SocialHistory = ({ formData, setFormData }) => {
  const [expanded, setExpanded] = useState(null);
  const socialHistory = formData.socialHistory;

  const toggleSection = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleCheckboxChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      socialHistory: { ...prev.socialHistory, [key]: !prev.socialHistory[key] },
    }));
  };

  const handleInputChange = (key, subKey, value) => {
    setFormData((prev) => ({
      ...prev,
      socialHistory: {
        ...prev.socialHistory,
        [key]: typeof prev.socialHistory[key] === "object"
          ? { ...prev.socialHistory[key], [subKey]: value }
          : value,
      },
    }));
  };

  return (
    <section className="mt-6 bg-white text-gray-800 border border-gray-200 rounded-3xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-[#023e8a] mb-6 flex items-center gap-3">
        <FaHeartbeat className="text-red-500 text-xl" />
        Social History
      </h3>

      <div className="space-y-5">
        {groupedSections.map((group, index) => (
          <div
            key={group.title}
            className="border border-gray-200 rounded-2xl shadow-sm bg-gray-50 hover:shadow-md transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex justify-between items-center px-5 py-4 text-left rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                {group.icon}
                <h4 className="text-lg font-semibold text-gray-800">
                  {group.title}
                </h4>
              </div>
              {expanded === index ? (
                <MdExpandLess className="text-2xl text-gray-600" />
              ) : (
                <MdExpandMore className="text-2xl text-gray-600" />
              )}
            </button>

            {expanded === index && (
              <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 bg-white rounded-b-2xl">
                {group.fields.map((key) => {
                  const value = socialHistory?.[key];

                  // Checkboxes for Yes/No fields
                  if (typeof value === "boolean") {
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-[#f9fafb] hover:bg-[#f1f5f9] rounded-xl p-3 transition-all duration-200 border border-gray-100"
                      >
                        <label
                          htmlFor={key}
                          className="text-sm font-semibold text-gray-900 cursor-pointer"
                        >
                          {fieldLabels[key]}
                        </label>
                        <input
                          id={key}
                          type="checkbox"
                          checked={value}
                          onChange={() => handleCheckboxChange(key)}
                          className="h-5 w-5 accent-[#0077b6] cursor-pointer"
                        />
                      </div>
                    );
                  }

                  // Text inputs for object fields
                  if (typeof value === "object" && value !== null) {
                    return (
                      <div
                        key={key}
                        className="bg-[#f9fafb] rounded-xl p-3 border border-gray-100"
                      >
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          {fieldLabels[key]}
                        </h5>
                        <div className="space-y-2">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div key={subKey}>
                              <label className="block text-xs text-gray-600 capitalize mb-1">
                                {subKey}
                              </label>
                              <input
                                type="text"
                                value={subValue || ""}
                                onChange={(e) =>
                                  handleInputChange(key, subKey, e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0077b6] outline-none"
                                placeholder={`Enter ${subKey}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Regular text inputs (e.g., diet, hobbies)
                  return (
                    <div
                      key={key}
                      className="bg-[#f9fafb] rounded-xl p-3 border border-gray-100"
                    >
                      <label className="text-sm font-semibold text-gray-900 mb-1 block">
                        {fieldLabels[key]}
                      </label>
                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) =>
                          handleInputChange(key, null, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0077b6] outline-none"
                        placeholder={`Enter ${fieldLabels[key]}...`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Step3SocialHistory;
