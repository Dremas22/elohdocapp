"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import DoctorsList from "./cards/DoctorsList";
import NursesList from "./cards/NursesList";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { doctorCategories, nurseCategories } from "@/constants/index";

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

  // Categories based on view
  const categories = useMemo(() => {
    if (view === "doctors") {
      return [{ id: "all", title: "All" }, ...doctorCategories];
    }
    if (view === "nurses") {
      return [{ id: "all", title: "All" }, ...nurseCategories];
    }
    return [];
  }, [view]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter staff by selected category id
  const filteredStaff = useMemo(() => {
    const staff = view === "doctors" ? doctors : nurses;
    if (selectedCategory === "all") return staff;
    return staff.filter((p) => p.category === selectedCategory);
  }, [doctors, nurses, view, selectedCategory]);

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
    return filteredStaff.map((person) => (
      <div key={person.userId} className="snap-start shrink-0 w-[90vw] sm:w-[300px]">
        {view === "doctors" ? (
          <DoctorsList doctors={[person]} sendNotificationToDoctor={sendNotificationToDoctor} />
        ) : (
          <NursesList nurses={[person]} sendNotificationToDoctor={sendNotificationToDoctor} />
        )}
      </div>
    ));
  };

  const getCategoryTitle = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.title : id;
  };

  return (
    <div className="w-full relative text-white">
      {/* Toggle buttons with negative top margin to move them higher */}
      {doctors.length > 0 && nurses.length > 0 && (
        <div className="flex justify-center sm:mb-4 space-x-4 -mt-2">
          <button
            title="View available doctors"
            onClick={() => {
              setView("doctors");
              setSelectedCategory("all");
            }}
            className={`bg-[#03045e] text-white py-2 px-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999]
              active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a]
              transition-all duration-200 ease-in-out cursor-pointer
              ${view === "doctors" ? "opacity-100" : "opacity-60"}`}
          >
            View Doctors
          </button>
          <button
            title="View available nurses"
            onClick={() => {
              setView("nurses");
              setSelectedCategory("all");
            }}
            className={`bg-[#03045e] text-white py-2 px-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999]
              active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a]
              transition-all duration-200 ease-in-out cursor-pointer
              ${view === "nurses" ? "opacity-100" : "opacity-60"}`}
          >
            View Nurses
          </button>
        </div>
      )}

      {/* Category filter dropdown - always visible if any staff in current view */}
      {(view === "doctors" ? doctors.length : nurses.length) > 0 && (
        <div className="flex justify-center sm:mb-4 mb-2 mt-4">
          <select
            className="rounded-md bg-[#123158] text-white p-2 shadow-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {(doctors.length > 0 || nurses.length > 0) && (
        <h2 className="text-2xl font-semibold text-center mt-1 sm:mt-10">
          Available {view[0].toUpperCase() + view.slice(1)}{" "}
          {selectedCategory !== "all" ? `- ${getCategoryTitle(selectedCategory)}` : ""}
        </h2>
      )}

      {/* Scroll Arrows */}
      {filteredStaff.length >= 4 && (
        <>
          <button
            onClick={() => scroll("left")}
            title="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46]
              hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            title="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#292a46]
              hover:bg-[#37385e] text-white p-3.5 rounded-full shadow-lg cursor-pointer"
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
