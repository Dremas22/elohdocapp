'use Client';

import React from "react";

const DooctorEarnings = () => {
  return (
    <div className="text-[#66e4ff] flex flex-col md:flex-row items-center justify-center gap-6 p-6 w-auto md:w-full">
      <div className="bg-[#123158] p-6 rounded-xl shadow-lg w-full md:w-1/2 text-center">
        <h1 className="text-lg font-semibold mb-2">Number of Consultations:</h1>
        <h2 className="text-3xl font-bold">0</h2>
      </div>
      <div className="bg-[#123158] p-6 rounded-xl shadow-lg w-full md:w-1/2 text-center">
        <h1 className="text-lg font-semibold mb-2">Total Monthly Earnings:</h1>
        <h2 className="text-3xl font-bold">0</h2>
      </div>
    </div>
  );
};

export default DooctorEarnings;
