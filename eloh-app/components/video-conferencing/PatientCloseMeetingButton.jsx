"use client";

import { IoExitOutline } from "react-icons/io5";

const PatientCloseMeetingButton = ({ onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        fixed
        bottom-2 right-4
        md:bottom-5 md:right-10
        lg:bottom-2.5 lg:mr-102
        h-[6.26vh]
        bg-[#222020]
        text-white
        py-3 px-6
        text-sm md:text-base
        font-semibold
        rounded-xl
        hover:bg-[#2d2a2a]
        transition duration-200 ease-in-out
        flex items-center gap-2
        z-50
      `}
        >
            <IoExitOutline size={20} className="md:size-[23px]" />
            <span className="hidden sm:inline">Leave</span>
        </button>
    );
};

export default PatientCloseMeetingButton;
