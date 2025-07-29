"use client";

const DownloadButton = ({
  children,
  type = "button",
  className = "",
  onClick,
  disabled,
}) => {
  return (
    <button
      type={type}
      className={`flex items-center gap-2 bg-[#03045e] text-white py-2 px-4 text-sm sm:text-base font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default DownloadButton;