"use client";

import { useState, useRef } from "react";
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
  const { currentUser } = useCurrentUser();

  const headerRef = useRef(null);
  const checkoutRef = useRef(null);

  const options = [
    { label: "Doctor", value: "doctor" },
    { label: "Nurse", value: "nurse" },
  ];

  const handleSelect = (optionValue) => {
    setSelectedOption(optionValue);
    setSelectedPackage(null);

    // Scroll back to the header
    setTimeout(() => {
      headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    // Scroll down to checkout button
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

  const handleCheckout = async () => {
    if (!selectedPackage?.subscriptionName) {
      toast.error("Please select a consultation package.");
      return;
    }

    const priceIdMap = {
      "1 Nurse consultation": "price_1RnETc05W53pwfR7Ypa9CnER",
      "2 Nurse consultations": "price_1RnESz05W53pwfR7DozsskCR",
      "3 Nurse consultations": "price_1RnERg05W53pwfR7HYvsbXyo",
      "1 Doctor consultation": "price_1RnEVF05W53pwfR7E3oYmlLg",
      "2 Doctor consultations": "price_1RnEUm05W53pwfR7j5WbV4jI",
      "3 Doctor consultations": "price_1RnEUG05W53pwfR7O6LMhnzv",
    };

    const priceId = priceIdMap[selectedPackage.subscriptionName];
    if (!priceId) {
      toast.error("Invalid package selected.");
      return;
    }

    const stripe = await stripePromise;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/stripe-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerEmail: currentUser?.email,
            role: "patient",
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        toast.error(`Error: ${data.error}`);
        return;
      }

      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center bg-white text-black">
      {/* Glowing blobs */}
      <div className="absolute w-52 h-52 sm:w-72 sm:h-72 bg-blue-300 rounded-full blur-[70px] sm:blur-[100px] top-0 left-6 opacity-20 animate-pulse z-0" />
      <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-blue-200 rounded-full blur-[80px] sm:blur-[100px] top-12 right-0 opacity-15 animate-pulse z-0" />

      {/* CONTENT */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Header */}
        <div ref={headerRef} className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#03045e]">
            Choose Your Consultation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            ElohDoc connects patients with qualified doctors and nurses. Select
            who you'd like to consult with and proceed to choose a package.
          </p>
        </div>

        {/* Option buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-6 text-sm sm:text-lg py-3 font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
                ${
                  selectedOption === option.value
                    ? "bg-[#03045e] text-white hover:bg-[#023e8a]"
                    : "text-white bg-[#03045e] border border-[#03045e] hover:bg-[#023e8a]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Payment options below */}
        <div className="w-full mt-10 scroll-mt-24">
          {selectedOption === "doctor" && (
            <PayToDoctor setSelectedPackage={handlePackageSelect} />
          )}
          {selectedOption === "nurse" && (
            <PayToNurse setSelectedPackage={handlePackageSelect} />
          )}
        </div>

        {/* Checkout */}
        {selectedPackage && (
          <div className="mt-10 text-center" ref={checkoutRef}>
            <button
              onClick={handleCheckout}
              className="bg-[#03045e] text-white py-3 px-10 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
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
