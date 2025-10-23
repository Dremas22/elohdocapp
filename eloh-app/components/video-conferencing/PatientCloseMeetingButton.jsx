"use client";

import { IoExitOutline } from "react-icons/io5";

const PatientCloseMeetingButton = ({ onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        fixed
        bottom-2 right-2.5
        md:bottom-2 md:right-20
        lg:bottom-2.5 lg:mr-102
        h-[6.26vh]
        bg-[#222020]
        text-white
        py-3 px-4
        text-sm md:text-base
        font-semibold
        rounded-xl
        hover:bg-[#2d2a2a]
        transition duration-200 ease-in-out
        flex items-center gap-2
        z-50
      `}
        >
            {/* Icon hidden on mobile */}
            <IoExitOutline size={20} className="hidden sm:flex md:size-[23px]" />

            {/* Always show the text */}
            <span>Leave</span>
        </button>
    );
};

export default PatientCloseMeetingButton;
