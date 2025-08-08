"use client";

import { useEffect } from "react";

const SearchBar = ({
  onSearch,
  setQuery,
  query,
  debouncedQuery,
  setDebouncedQuery,
}) => {
  // Debounce input by 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  // Trigger search callback on debounced change
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery.trim().toLowerCase());
    }
  }, [debouncedQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto my-2 flex items-center justify-center">
      <input
        type="text"
        placeholder="Search by Full name, ID number or Email..."
        title="Search for patients by Full name, ID number or Email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBar;
