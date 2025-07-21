"use client";

"use client";

import { useState } from "react";
import PayToDoctor from "./payToDoctor";
import PayToNurse from "./payToNurse";
import { loadStripe } from "@stripe/stripe-js";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const PayOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { currentUser, loading } = useCurrentUser();

  const options = [
    { label: "Doctor", value: "doctor" },
    { label: "Nurse", value: "nurse" },
  ];

  const handleSelect = (optionValue) => {
    setSelectedOption(optionValue);
  };

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-[#03045e]">
          Consult with:
        </h1>

        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          ElohDoc is a medical platform that enables doctors, nurses, and
          patients to interact, consult, and manage health services online.
          Choose a package below to begin.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition duration-200 ${selectedOption === option.value
                  ? "bg-[#03045e] text-white"
                  : "bg-gray-100 text-[#03045e] hover:bg-gray-200"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Render selected payment option component */}
        {selectedOption === "doctor" && (
          <PayToDoctor setSelectedPackage={setSelectedPackage} />
        )}
        {selectedOption === "nurse" && (
          <PayToNurse setSelectedPackage={setSelectedPackage} />
        )}

        {/* Checkout Button */}
        {selectedPackage && (
          <div className="mt-10">
            <button
              onClick={handleCheckout}
              className="bg-[#03045e] text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:bg-[#023e8a] transition duration-200"
            >
              Proceed to Checkout – {selectedPackage.price}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayOptions;
