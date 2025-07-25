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
      className={`bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default DownloadButton;
