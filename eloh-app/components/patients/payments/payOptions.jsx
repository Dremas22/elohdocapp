"use client";

import { useState } from "react";
import PayToDoctor from "./payToDoctor";
import PayToNurse from "./payToNurse";
import { loadStripe } from "@stripe/stripe-js";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";

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
    setSelectedPackage(null); // reset package when changing option
  };

  const handleCheckout = () => {
    // Placeholder until your Stripe logic is implemented
    toast.success("Redirecting to payment gateway...");
  };

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 px-4 py-12">

      {/* Animated glowing background blobs */}
      <div className="absolute w-52 h-52 sm:w-72 sm:h-72 bg-blue-300 rounded-full blur-[70px] sm:blur-[100px] top-0 left-6 opacity-20 animate-pulse z-0" />
      <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-blue-200 rounded-full blur-[80px] sm:blur-[100px] top-12 right-0 opacity-15 animate-pulse z-0" />
      <div className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-blue-100 rounded-full blur-[50px] sm:blur-[120px] top-15 center -translate-x-1/2 -translate-y-1/2 opacity-15 animate-pulse z-0" />

      <h1 className="text-4xl font-extrabold text-[#03045e] drop-shadow-sm">
        Choose Your Consultation
      </h1>

      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        ElohDoc connects patients with qualified doctors and nurses. Select
        who you'd like to consult with and proceed to choose a package.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`px-6 text-sm sm:text-lg py-3 font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
              ${selectedOption === option.value
                ? "bg-[#03045e] text-white hover:bg-[#023e8a]"
                : "text-white bg-[#03045e] border border-[#03045e] hover:bg-[#023e8a]"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="w-full mt-6">
        {selectedOption === "doctor" && (
          <PayToDoctor setSelectedPackage={setSelectedPackage} />
        )}
        {selectedOption === "nurse" && (
          <PayToNurse setSelectedPackage={setSelectedPackage} />
        )}
      </div>

      {selectedPackage && (
        <div className="mt-10">
          <button
            onClick={handleCheckout}
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer px-10"
          >
            Proceed to Checkout – {selectedPackage.price}
          </button>
        </div>
      )}
    </div>
  );
};

export default PayOptions;
