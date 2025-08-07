"use client";

import { useState } from "react";

const ITEMS_PER_PAGE = 5;

const FilteredPatientsTable = ({
  patients,
  setOpenViewPatientRecords,
  setSelectedPatient,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  if (!patients?.length) return null;

  const totalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePatients = patients.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // const handlePrevious = () => {
  //   if (currentPage > 1) setCurrentPage(currentPage - 1);
  // };

  // const handleNext = () => {
  //   if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  // };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mt-8 w-full overflow-x-auto">
      <div className="min-w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
        {/* Desktop Table */}
        <table className="min-w-[600px] w-full text-left text-sm text-gray-100 hidden sm:table">
          <thead className="bg-white/10 text-gray-300 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Full Name</th>
              <th className="px-6 py-4 whitespace-nowrap">ID Number</th>
              <th className="px-6 py-4 whitespace-nowrap">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visiblePatients.map((patient, idx) => (
              <tr
                key={idx}
                title="Click to view patient records"
                className="hover:bg-white/50 hover:text-black transition cursor-pointer"
                onClick={() => {
                  setSelectedPatient(patient);
                  setOpenViewPatientRecords(true);
                }}
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.fullName || "—"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.idNumber || "—"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.email || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-white/10">
          {visiblePatients.map((patient, idx) => (
            <div
              key={idx}
              className="p-4 cursor-pointer hover:bg-white/20 transition"
              onClick={() => {
                setSelectedPatient(patient);
                setOpenViewPatientRecords(true);
              }}
            >
              <div className="text-sm text-white font-semibold">
                {patient.fullName || "—"}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                <span className="font-medium">ID:</span>{" "}
                {patient.idNumber || "—"}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                <span className="font-medium">Email:</span>{" "}
                {patient.email || "—"}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-t border-white/10 bg-black/10">
          {/* Prev / Next */}
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm rounded ${
                currentPage === 1
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm rounded ${
                currentPage === totalPages
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex gap-1 flex-wrap justify-center sm:justify-start mt-2 sm:mt-0">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm rounded ${
                  page === currentPage
                    ? "bg-white text-black font-semibold"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteredPatientsTable;
