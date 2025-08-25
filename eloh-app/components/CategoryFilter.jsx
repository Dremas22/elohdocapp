"use client";

/**
 * CategoryFilter Component
 *
 * Renders a dropdown to filter doctors or nurses by category.
 * Fully responsive across mobile, tablet, and desktop.
 *
 * Props:
 * - options: Array of category objects ({id, title})
 * - selected: Currently selected category ID
 * - onChange: Callback when a new category is selected
 * - className: Additional container classes
 */

const CategoryFilter = ({ options = [], selected, onChange, className = "" }) => {
    if (!options.length) return null;

    return (
        <div className={`relative ${className}`}>
            <div className="flex justify-center sm:justify-start mb-3 mt-2">
                <select
                    title="Filter list by specialty "
                    className="w-full sm:w-60 md:w-72 lg:w-80 bg-[#123158] text-white p-3 sm:p-2 rounded-md shadow-md border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 cursor-pointer"
                    value={selected}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label="Filter by category"
                >
                    {options.map((opt) => (
                        <option
                            key={opt.id}
                            value={opt.id}
                            className="bg-gray-950 text-white"
                        >
                            {opt.title}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CategoryFilter;
