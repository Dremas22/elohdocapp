"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { doctorCategories, nurseCategories } from "@/constants/index";

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
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setView(getDefaultView());
    setSelectedCategory("all");
  }, [doctors, nurses]);

  const categories = useMemo(() => {
    if (view === "doctors")
      return [{ id: "all", title: "All" }, ...doctorCategories];
    if (view === "nurses")
      return [{ id: "all", title: "All" }, ...nurseCategories];
    return [];
  }, [view]);

  const filteredStaff = useMemo(() => {
    const staff = view === "doctors" ? doctors : nurses;

    if (selectedCategory.toLowerCase() === "all") return staff;

    return staff.filter((person) => {
      const categories = Array.isArray(person.category)
        ? person.category
        : typeof person.category === "string"
        ? [person.category]
        : [];

      return categories.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
      );
    });
  }, [doctors, nurses, view, selectedCategory]);

  useEffect(() => {
    console.log("View:", view);
    console.log("Selected Category:", selectedCategory);
    console.log("Filtered Staff:", filteredStaff);
  }, [filteredStaff, view, selectedCategory]);

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
            onClick={() => {
              setView("doctors");
              setSelectedCategory("all");
            }}
            className={`bg-[#03045e] py-2 px-3 rounded-xl font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition duration-200 ${
              view === "doctors" ? "opacity-100" : "opacity-60"
            }`}
          >
            View Doctors
          </button>
          <button
            title="View available nurses"
            onClick={() => {
              setView("nurses");
              setSelectedCategory("all");
            }}
            className={`bg-[#03045e] py-2 px-3 rounded-xl font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition duration-200 ${
              view === "nurses" ? "opacity-100" : "opacity-60"
            }`}
          >
            View Nurses
          </button>
        </div>
      )}

      {/* Category filter dropdown */}
      {(view === "doctors" ? doctors.length : nurses.length) > 0 && (
        <div className="relative">
          <div className="sm:left-0 sm:mb-0 mb-3 mt-4 flex justify-center sm:justify-start">
            <select
              className="rounded-md bg-[#123158] text-white p-2 shadow-md border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out cursor-pointer max-w-xs sm:w-full w-[40vh] hover:from-blue-600 hover:via-blue-500 hover:to-blue-600 ml-[-10px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter staff by category"
            >
              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.title}
                  className="bg-gray-950 text-white pl-[50vh] "
                >
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Heading with current view and category */}
      {(doctors.length > 0 || nurses.length > 0) && (
        <h2 className="sm:text-2xl text-xl font-semibold text-center mt-2 sm:mt-10">
          Available {view[0].toUpperCase() + view.slice(1)}{" "}
        </h2>
      )}

      {/* Scroll arrows - always visible */}
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

      {/* Scrollable staff cards or fallback message */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-4 px-2 scrollbar-hide -mt-3"
      >
        {filteredStaff.length === 0 ? (
          <p className="w-full text-center pt-5 text-gray-300">
            No{" "}
            {categories.find((c) => c.id === selectedCategory)?.title ||
              selectedCategory}
            s available at this time.
          </p>
        ) : (
          filteredStaff.map((person, idx) => (
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
