"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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

  const staffList = view === "doctors" ? doctors : nurses;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "right" ? 320 : -320,
        behavior: "smooth",
      });
    }
  };

  if (view === "none") return null;

  return (
    <div className="w-full relative text-white">
      {/* Toggle buttons */}
      {doctors.length > 0 && nurses.length > 0 && (
        <div className="flex justify-center sm:mb-4 space-x-4 -mt-3">
          <button
            title="View available doctors"
            onClick={() => setView("doctors")}
            className={`bg-[#03045e] py-2 px-3 rounded-xl font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition duration-200 ${view === "doctors" ? "opacity-100" : "opacity-60"
              }`}
          >
            View Doctors
          </button>
          <button
            title="View available nurses"
            onClick={() => setView("nurses")}
            className={`bg-[#03045e] py-2 px-3 rounded-xl font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition duration-200 ${view === "nurses" ? "opacity-100" : "opacity-60"
              }`}
          >
            View Nurses
          </button>
        </div>
      )}

      {/* Heading */}
      {(doctors.length > 0 || nurses.length > 0) && (
        <h2 className="sm:text-2xl text-xl font-semibold text-center mt-2 sm:mt-10">
          Available {view[0].toUpperCase() + view.slice(1)}
        </h2>
      )}

      {/* Scroll arrows */}
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

      {/* Staff Cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-4 px-2 scrollbar-hide -mt-3"
      >
        {staffList.length === 0 ? (
          <p className="w-full text-center pt-5 text-gray-300">
            No staff available at this time.
          </p>
        ) : (
          staffList.map((person, idx) => (
            <div
              key={person.userId ?? idx}
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
          ))
        )}
      </div>
    </div>
  );
};

export default StaffScroller;
