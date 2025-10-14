"use client";

import { useState } from "react";
import {
  FaHeartbeat,
  FaStethoscope,
  FaLungs,
  FaBrain,
  FaCapsules,
} from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const groupedMedicalSections = [
  {
    title: "Childhood Illnesses",
    icon: <FaHeartbeat className="text-red-500" />,
    field: "childhoodIllnesses",
    options: [
      "Measles",
      "Mumps",
      "Chickenpox",
      "Whooping cough",
      "Rheumatic fever",
      "Chronic medical condition",
      "Asthma",
      "HIV",
      "None",
      "Other",
    ],
  },
  {
    title: "Adult Illnesses",
    icon: <FaStethoscope className="text-blue-600" />,
    field: "adultIllnesses",
    options: ["Diabetes", "Hypertension", "Heart disease", "None", "Other"],
  },
  {
    title: "Major Injuries",
    icon: <FaLungs className="text-green-600" />,
    field: "majorInjuries",
    options: [
      "Fractures",
      "Head injury / Concussion",
      "Severe burns",
      "Sports injuries",
      "Back or spinal injury",
      "None",
      "Other",
    ],
  },
  {
    title: "Surgeries",
    icon: <FaBrain className="text-purple-600" />,
    field: "surgeries",
    options: [
      "Appendectomy",
      "Tonsillectomy",
      "Hernia repair",
      "Gallbladder removal",
      "Cesarean section",
      "Heart surgery",
      "Joint replacement",
      "None",
      "Other",
    ],
  },
  {
    title: "Hospitalizations",
    icon: <FaCapsules className="text-orange-600" />,
    field: "hospitalizations",
    options: [
      "Covid",
      "Chronic illness",
      "Heart failure",
      "Stroke",
      "Diarrhea",
      "Kidney failure",
      "Severe allergy reaction",
      "None",
      "Other",
    ],
  },
];

const Step5MedicalHistory = ({ formData, setFormData, errors }) => {
  const [expanded, setExpanded] = useState(null);
  const { medicalHistory } = formData;

  const toggleSection = (index) => setExpanded(expanded === index ? null : index);

  const handleCheckboxChange = (field, value) => {
    const current = medicalHistory[field] || [];
    setFormData({
      ...formData,
      medicalHistory: {
        ...medicalHistory,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      },
    });
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

  return (
    <section className="mt-6 bg-white text-gray-800 border border-gray-200 rounded-3xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-[#023e8a] mb-6 flex items-center gap-3">
        <FaStethoscope className="text-blue-600 text-xl" />
        Medical History
      </h3>

      <div className="space-y-5">
        {groupedMedicalSections.map((group, index) => (
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
                {group.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center justify-between bg-[#f9fafb] hover:bg-[#f1f5f9] rounded-xl p-3 border border-gray-100 transition-all duration-200"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {option}
                    </span>
                    <input
                      type="checkbox"
                      checked={medicalHistory[group.field]?.includes(option)}
                      onChange={() => handleCheckboxChange(group.field, option)}
                      className="h-5 w-5 accent-[#0077b6] cursor-pointer"
                    />
                  </label>
                ))}

                {/* Other text input */}
                {medicalHistory[group.field]?.includes("Other") && (
                  <div className="bg-[#f9fafb] rounded-xl p-3 border border-gray-100 sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      placeholder="Enter additional info"
                      value={
                        medicalHistory[
                        `other${group.field.charAt(0).toUpperCase() + group.field.slice(1)}`
                        ] || ""
                      }
                      onChange={(e) =>
                        handleOtherChange(group.field, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0077b6] outline-none"
                    />
                  </div>
                )}

                {/* Validation Errors */}
                {errors[group.field] && (
                  <p className="text-sm text-red-600 mt-1">{errors[group.field]}</p>
                )}
                {medicalHistory[group.field]?.includes("Other") &&
                  errors[
                  `other${group.field.charAt(0).toUpperCase() + group.field.slice(1)}`
                  ] && (
                    <p className="text-sm text-red-600 mt-1">
                      {
                        errors[
                        `other${group.field.charAt(0).toUpperCase() + group.field.slice(1)}`
                        ]
                      }
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

export default Step5MedicalHistory;
