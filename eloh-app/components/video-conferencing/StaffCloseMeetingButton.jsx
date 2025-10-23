"use client";

import { IoExitOutline } from "react-icons/io5";

const StaffCloseMeetingButton = ({ onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        fixed bottom-87 right-7
        md:fixed md:bottom-1 md:right-56
        lg:absolute lg:bottom-2.5 lg:right-23.5
        h-[6.5vh] bg-[#222020] text-white py-2 px-4 md:px-6 text-base font-semibold 
        rounded-xl hover:bg-[#2d2a2a] transition duration-200 ease-in-out 
        flex items-center gap-2 z-50
      `}
        >
            <IoExitOutline size={23} />
            {/* Only show text on medium screens and above */}
            <span className="hidden md:inline">End Meeting</span>
        </button>
    );
};

export default StaffCloseMeetingButton;
