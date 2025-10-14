"use client";

import { useState } from "react";
import { FaHeartbeat, FaRunning, FaGlassCheers, FaHome } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// Sections and fields
const groupedSections = [
  {
    title: "Substance Use",
    icon: <FaGlassCheers className="text-yellow-600" />,
    fields: ["alcohol", "smoking", "drugs"],
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

// Options per field
const fieldOptions = {
  alcohol: ["Current", "Occasional", "None", "Other"],
  smoking: ["Current", "Occasional", "Never", "None", "Other"], // fixed
  drugs: ["Current", "Occasional", "None", "Other"],
  diet: ["Balanced", "Vegetarian", "Vegan", "Low-carb", "High-Protein", "Mediterranean", "Unhealthy", "Skips Meals", "Other"],
  exercise: ["Never", "Light", "Moderate", "Intense", "Home-Gym", "Sedentary", "Other"],
  hobbies: ["Reading", "Sports", "Travel", "Music", "None", "Other"],
  livingSituation: [
    "Alone",
    "Family",
    "Partner",
    "Shared",
    "Retirement Home",
    "Hostel / Dormitory",
    "None",
    "Other",
  ],
};




// Labels for display
const fieldLabels = {
  alcohol: "Alcohol Use",
  smoking: "Smoking Habits",
  drugs: "Drug Use",
  diet: "Dietary Habits",
  exercise: "Exercise Routine",
  hobbies: "Hobbies & Interests",
  livingSituation: "",
};

const Step5SocialHistory = ({ formData, setFormData }) => {
  const [expanded, setExpanded] = useState(null);
  const { socialHistory } = formData;

  const toggleSection = (index) => setExpanded(expanded === index ? null : index);

  const handleCheckboxChange = (field, value) => {
    const current = Array.isArray(socialHistory[field]) ? socialHistory[field] : [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setFormData({
      ...formData,
      socialHistory: {
        ...socialHistory,
        [field]: updated,
      },
    });
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

  return (
    <section className="mt-6 bg-white text-gray-800 border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-md">
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
            {/* Collapsible Header */}
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-left rounded-t-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {group.icon}
                <h4 className="text-lg font-semibold text-gray-800">{group.title}</h4>
              </div>
              {expanded === index ? (
                <MdExpandLess className="text-2xl text-gray-600" />
              ) : (
                <MdExpandMore className="text-2xl text-gray-600" />
              )}
            </button>

            {/* Expanded content */}
            {expanded === index && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 bg-white rounded-b-2xl">
                {group.fields.map((field) => (
                  <div
                    key={field}
                    className={`bg-[#f9fafb] rounded-xl lg:-ml-5 p-4 sm:p-4 border border-gray-100 w-[26vh] ${["livingSituation", "drugs", "hobbies"].includes(field) ? "lg:w-[45vh]" : ""}`}
                  >
                    {fieldLabels[field] && (
                      <h5 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
                        {fieldLabels[field]}
                      </h5>
                    )}

                    {/* Checkbox options */}
                    <div className="space-y-2">
                      {fieldOptions[field].map((option) => (
                        <label
                          key={option}
                          className={`flex flex-wrap w-[32vh] items-center justify-between bg-white hover:bg-[#f1f5f9] rounded-lg p-2 sm:p-3 border border-gray-200 transition-all duration-200 font-semibold text-gray-900 w-full ${["livingSituation", "drugs", "hobbies"].includes(field) ? "lg:w-[35vh]" : ""}`}
                        >
                          <span className="text-sm sm:text-base font-semibold break-words">{option}</span>
                          <input
                            type="checkbox"
                            checked={
                              Array.isArray(socialHistory[field])
                                ? socialHistory[field].includes(option)
                                : false
                            }
                            onChange={() => handleCheckboxChange(field, option)}
                            className="h-4 w-4 sm:h-5 sm:w-5 accent-[#0077b6] cursor-pointer ml-2 sm:ml-3"
                          />
                        </label>
                      ))}

                      {/* Only show 'Other' input if 'Other' selected */}
                      {Array.isArray(socialHistory[field]) &&
                        socialHistory[field].includes("Other") && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={
                              socialHistory[
                              `other${field.charAt(0).toUpperCase() + field.slice(1)}`
                              ] || ""
                            }
                            onChange={(e) => handleOtherChange(field, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#0077b6] outline-none mt-2"
                          />
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Step5SocialHistory;
