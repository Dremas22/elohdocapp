"use client";

import { useEffect, useState, useRef } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const StaffScroller = ({ doctors = [], nurses = [], sendNotificationToDoctor }) => {
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

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "right" ? 320 : -320,
        behavior: "smooth",
      });
    }
  };

  if (view === "none") return null;

  const renderCards = () => {
    const staff = view === "doctors" ? doctors : nurses;

    return staff.map((person) => (
      <div
        key={person.id}
        className="snap-start shrink-0 w-[90vw] sm:w-[300px]"
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
    <div className="w-full relative">
      {/* Toggle Buttons */}
      {doctors.length > 0 && nurses.length > 0 && (
        <div className="flex justify-center mb-4 space-x-4">
          <button
            title="View available doctors"
            onClick={() => setView("doctors")}
            className={`bg-[#03045e] text-white py-1 px-2 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${view === "doctors"
              }`}
          >
            View Doctors
          </button>
          <button
            title="View available nurses"
            onClick={() => setView("nurses")}
            className={`bg-[#03045e] text-white py-1 px-2 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${view === "nurses"
              }`}
          >
            View Nurses
          </button>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mt-10 mb-4 text-white">
        Available {view[0].toUpperCase() + view.slice(1)}
      </h2>

      {/* Scroll Arrows - show only if enough staff */}
      {(doctors.length + nurses.length) >= 4 && (
        <>
          <button
            onClick={() => scroll("left")}
            title="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            title="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46] hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
          >
            <FaArrowRight />
          </button>
        </>
      )}

      {/* Scrollable cards container */}
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
