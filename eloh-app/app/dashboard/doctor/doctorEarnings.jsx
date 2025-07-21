'use Client';

import React from "react";

const DooctorEarnings = () => {
  return (
    <div className="text-[#66e4ff] flex flex-col md:flex-row items-center justify-center gap-8 p-8 w-auto md:w-full">
      {/* Consultations Card */}
      <div className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full md:w-1/2 text-center
                      transform transition-transform duration-300 hover:scale-100 hover:shadow-[#0d6efd]/50 cursor-default">
        <h1 className="text-xl font-semibold mb-3 tracking-wide text-[#66e4ff] drop-shadow-md">
          Number of Consultations:
        </h1>

        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">0</h2>
        <p className="mt-2 text-sm text-[#a0cfff]">This month</p>
      </div>

      {/* Earnings Card */}
      <div className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full md:w-1/2 text-center
                      transform transition-transform duration-300 hover:scale-100 hover:shadow-[#0d6efd]/50 cursor-default">
        <h1 className="text-xl font-semibold mb-3 tracking-wide text-[#66e4ff] drop-shadow-md">
          Total Monthly Earnings:
        </h1>
        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">R 0.00</h2>
        <p className="mt-2 text-sm text-[#a0cfff]">Based on completed consultations</p>
      </div>
    </div>
  );
};

export default DooctorEarnings;
