"use client";

import { IoExitOutline } from "react-icons/io5";

const StaffCloseMeetingButton = ({ onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        fixed bottom-76.5 right-1.5
        md:fixed md:bottom-4 md:right-4
        lg:absolute lg:bottom-2.5 lg:right-22
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
