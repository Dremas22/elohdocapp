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
    <section className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
      <h3 className="text-2xl font-semibold text-[#023e8a] mb-6 flex items-center gap-3">
        <FaHeartbeat className="text-red-500 text-xl" />
        Social History
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(socialHistorySections).map(([key, { label, icon }]) => {
          const value = socialHistory?.[key];
          let displayValue = "";

          if (typeof value === "boolean") {
            displayValue = value ? (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <MdCheckCircle className="text-base" />
                Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                <MdCancel className="text-base" />
                No
              </span>
            );
          } else if (typeof value === "object" && value !== null) {
            displayValue = (
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-1">
                {Object.entries(value).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-medium text-gray-800 capitalize">{k}</span>: {v}
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
              className="bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xl">{icon}</div>
                <h4 className="text-base font-semibold text-gray-900">{label}</h4>
              </div>
              <div className="pl-1">{displayValue}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SocialHistorySection;
