"use client";

const Step3SocialHistory = ({ formData, setFormData, errors }) => {
  const { socialHistory } = formData;

  const updateSocialField = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialHistory: {
        ...prev.socialHistory,
        [section]:
          typeof prev.socialHistory[section] === "object" && key
            ? { ...prev.socialHistory[section], [key]: value }
            : value,
      },
    }));
  };

  const toggleSection = (field) => {
    const isActive = formData.socialHistory[field];
    setFormData((prev) => ({
      ...prev,
      socialHistory: {
        ...prev.socialHistory,
        [field]: !isActive,
        ...(field === "isSmoker" && !isActive
          ? { smoking: { status: "former", packYears: "" } }
          : field === "isSmoker" && isActive
            ? { smoking: { status: "", packYears: "" } }
            : {}),
        ...(field === "usesAlcohol" && !isActive
          ? { alcohol: { type: "Beer", frequency: "", amount: "" } }
          : field === "usesAlcohol" && isActive
            ? { alcohol: { type: "", frequency: "", amount: "" } }
            : {}),
        ...(field === "usesDrugs" && !isActive
          ? { drugs: { type: "Cannabis", frequency: "", route: "" } }
          : field === "usesDrugs" && isActive
            ? { drugs: { type: "", frequency: "", route: "" } }
            : {}),
      },
    }));
  };

  const packYearRanges = [
    "1-2 years",
    "3-5 years",
    "6-10 years",
    "11-15 years",
    "16+ years",
  ];

  const frequencyOptions = [
    "Daily",
    "Weekly",
    "Monthly",
    "Occasionally",
    "Rarely",
  ];

  const amountOptions = ["1-2 units", "3-5 units", "6-10 units", "10+ units"];

  return (
    <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <div className="col-span-full mb-2">
        <h2 className="text-xl font-semibold text-blue-800">
          Social History
        </h2>
        <p className="text-sm text-gray-500">
          This information helps us provide holistic care tailored to your
          lifestyle.
        </p>
      </div>

      {/* Smoking Section */}
      <div className="p-5 rounded-xl border border-gray-200 bg-blue-50">
        <label className="inline-flex items-center gap-2 font-medium text-blue-800">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={socialHistory.isSmoker}
            onChange={() => toggleSection("isSmoker")}
          />
          Smoking
        </label>
        {socialHistory.isSmoker && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={socialHistory.smoking.status}
              onChange={(e) =>
                updateSocialField("smoking", "status", e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            >
              <option value="former">Former</option>
              <option value="current">Current</option>
            </select>
            <select
              value={socialHistory.smoking.packYears}
              onChange={(e) =>
                updateSocialField("smoking", "packYears", e.target.value)
              }
              className={`w-full px-4 py-3 rounded-lg border ${errors.packYears ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
            >
              <option value="">Select Pack Years</option>
              {packYearRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Alcohol Section */}
      <div className="p-5 rounded-xl border border-gray-200 bg-blue-50">
        <label className="inline-flex items-center gap-2 font-medium text-blue-800">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={socialHistory.usesAlcohol}
            onChange={() => toggleSection("usesAlcohol")}
          />
          Alcohol Use
        </label>
        {socialHistory.usesAlcohol && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={socialHistory.alcohol.type}
              onChange={(e) =>
                updateSocialField("alcohol", "type", e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            >
              <option value="Beer">Beer</option>
              <option value="Wine">Wine</option>
              <option value="Spirits">Spirits</option>
              <option value="Occasional">Occasional</option>
            </select>
            <select
              value={socialHistory.alcohol.frequency}
              onChange={(e) =>
                updateSocialField("alcohol", "frequency", e.target.value)
              }
              className={`w-full px-4 py-3 rounded-lg border ${errors.alcoholFrequency ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
            >
              <option value="">Select Frequency</option>
              {frequencyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              value={socialHistory.alcohol.amount}
              onChange={(e) =>
                updateSocialField("alcohol", "amount", e.target.value)
              }
              className={`w-full px-4 py-3 rounded-lg border ${errors.alcoholAmount ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
            >
              <option value="">Select Amount</option>
              {amountOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Drugs Section */}
      <div className="p-5 rounded-xl border border-gray-200 bg-blue-50">
        <label className="inline-flex items-center gap-2 font-medium text-blue-800">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={socialHistory.usesDrugs}
            onChange={() => toggleSection("usesDrugs")}
          />
          Non-prescribed Drug Use
        </label>
        {socialHistory.usesDrugs && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={socialHistory.drugs.type}
              onChange={(e) =>
                updateSocialField("drugs", "type", e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            >
              <option value="Cannabis">Cannabis</option>
              <option value="Stimulants">Stimulants</option>
              <option value="Opiates">Opiates</option>
              <option value="Hallucinogens">Hallucinogens</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={socialHistory.drugs.frequency}
              onChange={(e) =>
                updateSocialField("drugs", "frequency", e.target.value)
              }
              className={`w-full px-4 py-3 rounded-lg border ${errors.drugFrequency ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
            >
              <option value="">Select Frequency</option>
              {frequencyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={socialHistory.drugs.route}
              onChange={(e) =>
                updateSocialField("drugs", "route", e.target.value)
              }
              placeholder="Administration Route"
              className={`w-full px-4 py-3 rounded-lg border ${errors.drugRoute ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
            />
          </div>
        )}
      </div>

      {/* Lifestyle Fields */}
      <div className="col-span-full p-5 border border-gray-200 bg-blue-50 rounded-xl mt-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Lifestyle & Daily Habits
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide additional details about your daily lifestyle. This
          helps us tailor your care plan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-700">
              Diet
            </label>
            <input
              type="text"
              value={socialHistory.diet}
              onChange={(e) => updateSocialField("diet", null, e.target.value)}
              placeholder="e.g. Balanced, Vegetarian, Keto"
              className={`w-full px-4 py-3 rounded-lg border ${errors.diet ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-blue-700">
              Exercise
            </label>
            <input
              type="text"
              value={socialHistory.exercise}
              onChange={(e) =>
                updateSocialField("exercise", null, e.target.value)
              }
              placeholder="e.g. 3 times a week, daily walks"
              className={`w-full px-4 py-3 rounded-lg border ${errors.exercise ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-blue-700">
              Hobbies
            </label>
            <input
              type="text"
              value={socialHistory.hobbies}
              onChange={(e) =>
                updateSocialField("hobbies", null, e.target.value)
              }
              placeholder="e.g. Reading, Gardening"
              className={`w-full px-4 py-3 rounded-lg border ${errors.hobbies ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-blue-700">
              Living Situation
            </label>
            <input
              type="text"
              value={socialHistory.livingSituation}
              onChange={(e) =>
                updateSocialField("livingSituation", null, e.target.value)
              }
              placeholder="e.g. Alone, With family"
              className={`w-full px-4 py-3 rounded-lg border ${errors.livingSituation ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3SocialHistory;
