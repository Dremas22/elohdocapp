"use client";

import SocialHistorySection from "./SocialHistorySection";
import ToggleMedicalSection from "./ToggleMedicalSection";

const FullMedicalRecords = ({ medicalHistory, loading, socialHistory }) => {
  if (loading)
    return (
      <p className="text-sm text-gray-500 italic px-4 py-2 bg-yellow-50 rounded-md">
        Loading medical records...
      </p>
    );

  if (!medicalHistory || !socialHistory)
    return (
      <p className="text-red-500 px-4 py-2 bg-red-50 rounded-md">
        No data found for this patient.
      </p>
    );

  const staticSections = {
    adultIllnesses: "Adult Illnesses",
    childhoodIllnesses: "Childhood Illnesses",
    hospitalizations: "Hospitalizations",
    majorInjuries: "Major Injuries",
    surgeries: "Surgeries",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full px-2 md:px-4">
      {/* Left - Dynamic Medical & Social Sections */}
      <div className="w-full lg:w-3/4 flex flex-col gap-6 overflow-y-auto">
        <section className="bg-white rounded-2xl  shadow-md">
          <ToggleMedicalSection medicalHistory={medicalHistory} />
        </section>

        <section>
          <SocialHistorySection socialHistory={socialHistory} />
        </section>
      </div>

      {/* Right - Static Sections */}
      <aside className="w-full lg:w-1/4 space-y-5 overflow-y-auto">
        {Object.entries(staticSections).map(([key, title]) => (
          <div
            key={key}
            className="bg-white  border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-[#023e8a] mb-3 border-b border-blue-100 pb-1">
              {title}
            </h3>

            {medicalHistory?.[key]?.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                {medicalHistory[key].map((item, index) => (
                  <li key={index}>
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No records found.</p>
            )}
          </div>
        ))}
      </aside>
    </div>
  );
};

export default FullMedicalRecords;
