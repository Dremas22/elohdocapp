"use client";

import {
  FaSmoking,
  FaHeartbeat,
  FaUtensils,
  FaPills,
  FaRunning,
  FaGlassCheers,
  FaHome,
  FaStar,
  FaCannabis,
} from "react-icons/fa";
import { MdCheckCircle, MdCancel } from "react-icons/md";

const socialHistorySections = {
  alcohol: {
    label: "Alcohol Use",
    icon: <FaGlassCheers className="text-yellow-600" />,
  },
  usesAlcohol: {
    label: "Currently Uses Alcohol",
    icon: <MdCheckCircle className="text-green-600" />,
  },
  smoking: {
    label: "Smoking Habits",
    icon: <FaSmoking className="text-gray-600" />,
  },
  isSmoker: {
    label: "Currently Smokes",
    icon: <FaSmoking className="text-red-500" />,
  },
  drugs: {
    label: "Drug Use",
    icon: <FaCannabis className="text-purple-600" />,
  },
  usesDrugs: {
    label: "Currently Uses Drugs",
    icon: <MdCheckCircle className="text-red-600" />,
  },
  diet: {
    label: "Dietary Habits",
    icon: <FaUtensils className="text-green-700" />,
  },
  exercise: {
    label: "Exercise Routine",
    icon: <FaRunning className="text-blue-700" />,
  },
  hobbies: {
    label: "Hobbies & Interests",
    icon: <FaStar className="text-orange-500" />,
  },
  livingSituation: {
    label: "Living Situation",
    icon: <FaHome className="text-indigo-600" />,
  },
};

const SocialHistorySection = ({ socialHistory }) => {
  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[#023e8a] mb-4 flex items-center gap-2">
        <FaHeartbeat className="text-red-500" />
        Social History
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(socialHistorySections).map(([key, { label, icon }]) => {
          const value = socialHistory?.[key];

          let displayValue = "";

          if (typeof value === "boolean") {
            displayValue = value ? (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <MdCheckCircle /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                <MdCancel /> No
              </span>
            );
          } else if (typeof value === "object" && value !== null) {
            displayValue = (
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {Object.entries(value).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-medium text-gray-800 capitalize">
                      {k}
                    </span>
                    : {v}
                  </li>
                ))}
              </ul>
            );
          } else {
            displayValue = (
              <span className="text-gray-700 text-sm">{value || "N/A"}</span>
            );
          }

          return (
            <div
              key={key}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
              </div>
              <div>{displayValue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialHistorySection;
