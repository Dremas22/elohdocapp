"use client";

/**
 * ToggleButton Component
 *
 * A custom toggle switch (styled checkbox) component.
 * - Accepts `checked` (boolean) to control the switch state.
 * - Accepts `onChange` (function) to handle state changes.
 */
const ToggleButton = ({ checked, onChange, fetching }) => {
  return (
    <label className="inline-flex items-center cursor-pointer select-none relative">
      {/* Visually hidden checkbox input */}
      <input
        type="checkbox"
        checked={checked}
        onChange={async () => {
          await onChange();
        }}
        className="sr-only peer disabled:cursor-not-allowed"
        disabled={fetching}
      />

      {/* Custom toggle UI element */}
      <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-500 peer-checked:bg-blue-400 dark:peer-checked:bg-blue-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#03045e] after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:border-white" />

      {/* Spinner overlay when loading */}
      {fetching && (
        <div className="absolute left-0 top-0 w-11 h-6 flex items-center justify-center bg-white/60 rounded-full z-10">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </label>
  );
};

export default ToggleButton;
