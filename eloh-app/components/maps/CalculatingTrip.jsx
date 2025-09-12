const CalculatingTrip = () => {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-blue-400 text-blue-800 rounded-md border border-blue-300 text-sm font-medium animate-pulse">
      {/* Spinner */}
      <svg
        className="w-4 h-4 text-blue-800 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span>Calculating trip...</span>
    </div>
  );
};

export default CalculatingTrip;
