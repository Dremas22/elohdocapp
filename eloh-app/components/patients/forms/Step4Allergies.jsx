"use client";

import { useState } from "react";
import { FaHeartbeat, FaPills, FaUtensils, FaLeaf } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const groupedAllergySections = [
  {
    title: "Medication Allergies",
    icon: <FaPills className="text-blue-600" />,
    field: "medications",
  },
  {
    title: "Food Allergies",
    icon: <FaUtensils className="text-orange-600" />,
    field: "food",
  },
  {
    title: "Environmental Allergies",
    icon: <FaLeaf className="text-green-600" />,
    field: "environmental",
  },
];

const allergyOptions = {
  medications: [
    "Penicillin",
    "Aspirin",
    "Ibuprofen",
    "Sulfa drugs",
    "Morphine / Opioids",
    "Antibiotic",
    "None",
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
    "None",
  ],
  environmental: [
    "Pollen",
    "Dust mites",
    "Mold",
    "Pet dander",
    "Insect stings",
    "Grass",
    "None",
  ],
};

const Step4Allergies = ({ formData, setFormData, errors }) => {
  const [expanded, setExpanded] = useState(null);
  const { allergies } = formData;

  const toggleSection = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleCheckboxChange = (type, value) => {
    const current = allergies[type] || [];
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        [type]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      },
    });
  };
  const handleOtherCheckbox = (type) => {
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        other: {
          ...allergies.other,
          [type]: {
            ...allergies.other[type],
            isChecked: !allergies.other[type].isChecked,
          },
        },
      },
    });
  };

  const handleOtherTextChange = (type, text) => {
    setFormData({
      ...formData,
      allergies: {
        ...allergies,
        other: {
          ...allergies.other,
          [type]: {
            ...allergies.other[type],
            text,
          },
        },
      },
    });
  };

  return (
    <section className="mt-6 bg-white text-gray-800 border border-gray-200 rounded-3xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-[#023e8a] mb-6 flex items-center gap-3">
        <FaHeartbeat className="text-red-500 text-xl" />
        Allergies
      </h3>

      <div className="space-y-5">
        {groupedAllergySections.map((group, index) => (
          <div
            key={group.title}
            className="border border-gray-200 rounded-2xl shadow-sm bg-gray-50 hover:shadow-md transition-all duration-300"
          >
            {/* Collapsible Header */}
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

            {/* Expanded Content */}
            {expanded === index && (
              <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 bg-white rounded-b-2xl">
                {allergyOptions[group.field].map((option) => (
                  <label
                    key={option}
                    className="flex items-center justify-between bg-[#f9fafb] hover:bg-[#f1f5f9] rounded-xl p-3 border border-gray-100 transition-all duration-200"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {option}
                    </span>
                    <input
                      type="checkbox"
                      checked={allergies[group.field]?.includes(option)}
                      onChange={() => handleCheckboxChange(group.field, option)}
                      className="h-5 w-5 accent-[#0077b6] cursor-pointer"
                    />
                  </label>
                ))}

                {/* "Other" Option */}
                <div className="bg-[#f9fafb] rounded-xl p-3 border border-gray-100 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <input
                      type="checkbox"
                      checked={
                        allergies.other?.[group.field]?.isChecked || false
                      }
                      onChange={() => handleOtherCheckbox(group.field)}
                      className="h-5 w-5 accent-[#0077b6]"
                    />
                    <span>Other</span>
                  </label>

                  {allergies.other?.[group.field]?.isChecked && (
                    <input
                      type="text"
                      placeholder="Please specify"
                      value={allergies.other?.[group.field]?.text || ""}
                      onChange={(e) =>
                        handleOtherTextChange(group.field, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0077b6] outline-none"
                    />
                  )}
                </div>

                {/* Validation Errors */}
                {errors[group.field] && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors[group.field]}
                  </p>
                )}
                {allergies.other?.isChecked && errors.otherText && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.otherText}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Step4Allergies;
