"use client";

import React from "react";

const PayToNurse = ({ setPaymentMethod, setShowPaymentOptions }) => {
  return (
    <div className="text-black">
      <h2 className="text-2xl font-semibold mb-6">Choose a Consultation Package</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-[#caf0f8] p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold mb-2">1 Consultation</h1>
            <p className="mb-4">
              Access to once-off consultation, nurse prescription and sick note.
            </p>
          </div>
          <button
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] 
              transition-all duration-200 ease-in-out cursor-pointer"
          >
            R200
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-[#caf0f8] p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold mb-2">2 Consultations</h1>
            <p className="mb-4">
              Access to 2 consultations, nurse prescriptions and sick notes.
            </p>
          </div>
          <button
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] 
              transition-all duration-200 ease-in-out cursor-pointer"
          >
            R400
          </button>
        </div>
        <div className="bg-[#caf0f8] p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold mb-2">3 Consultations</h1>
            <p className="mb-4">
              Access to 3 consultations, nurse prescriptions and sick notes.
            </p>
          </div>
          <button
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] 
              transition-all duration-200 ease-in-out cursor-pointer"
          >
            R600
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayToNurse;
