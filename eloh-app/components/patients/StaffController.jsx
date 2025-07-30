import { useEffect, useState, useRef } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";

const StaffScroller = ({
  doctors = [],
  nurses = [],
  sendNotificationToDoctor,
}) => {
  const scrollRef = useRef(null);

  // Determine the initial view based on available data
  const getDefaultView = () => {
    if (doctors.length > 0) return "doctors";
    if (nurses.length > 0) return "nurses";
    return "none";
  };

  const [view, setView] = useState(getDefaultView);

  // Update view reactively when doctors or nurses change
  useEffect(() => {
    setView(getDefaultView());
  }, [doctors, nurses]);

  // Nothing to show
  if (view === "none") return null;

  return (
    <div className="w-full">
      {/* Toggle Buttons (only show if both doctors & nurses exist) */}
      {doctors.length > 0 && nurses.length > 0 && (
        <div className="flex justify-center mb-4 space-x-4">
          <button
            onClick={() => setView("doctors")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === "doctors"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Doctors
          </button>
          <button
            onClick={() => setView("nurses")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === "nurses"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Nurses
          </button>
        </div>
      )}

      {/* Section Heading */}
      <h2 className="text-2xl font-semibold text-center mt-10 mb-6 text-white">
        Available {view[0].toUpperCase() + view.slice(1)}
      </h2>

      {/* Scrollable Staff Cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 px-2 scrollbar-hide"
      >
        {view === "doctors" ? (
          <DoctorsList
            doctors={doctors}
            sendNotificationToDoctor={sendNotificationToDoctor}
          />
        ) : (
          <NursesList
            nurses={nurses}
            sendNotificationToDoctor={sendNotificationToDoctor}
          />
        )}
      </div>
    </div>
  );
};

export default StaffScroller;
