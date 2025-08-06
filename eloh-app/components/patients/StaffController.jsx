import { useEffect, useState, useRef } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";

const StaffScroller = ({
  doctors = [],
  nurses = [],
  sendNotificationToDoctor,
}) => {
  const scrollRef = useRef(null);

  const getDefaultView = () => {
    if (doctors.length > 0) return "doctors";
    if (nurses.length > 0) return "nurses";
    return "none";
  };

  const [view, setView] = useState(getDefaultView);

  useEffect(() => {
    setView(getDefaultView());
  }, [doctors, nurses]);

  if (view === "none") return null;

  const renderCards = () => {
    const staff = view === "doctors" ? doctors : nurses;

    return staff.map((person) => (
      <div
        key={person.id}
        className="snap-start shrink-0 w-[90vw] sm:w-[300px]" // One tile at a time on mobile
      >
        {view === "doctors" ? (
          <DoctorsList
            doctors={[person]}
            sendNotificationToDoctor={sendNotificationToDoctor}
          />
        ) : (
          <NursesList
            nurses={[person]}
            sendNotificationToDoctor={sendNotificationToDoctor}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="w-full">
      {doctors.length > 0 && nurses.length > 0 && (
        <div className="flex justify-center mb-4 space-x-4">
          <button
            title="View available doctors"
            onClick={() => setView("doctors")}
            className={`bg-[#03045e] text-white py-1 px-2 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${view === "doctors"}`}
          >
            View Doctors
          </button>
          <button
            title="View available nurses"
            onClick={() => setView("nurses")}
            className={`bg-[#03045e] text-white py-1 px-2 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${view === "nurses"}`}
          >
            View Nurses
          </button>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mt-10 mb-4 text-white">
        Available {view[0].toUpperCase() + view.slice(1)}
      </h2>

      {/* Horizontally scrollable and snapping cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-4 px-2 scrollbar-hide"
      >
        {renderCards()}
      </div>
    </div>
  );
};

export default StaffScroller;
