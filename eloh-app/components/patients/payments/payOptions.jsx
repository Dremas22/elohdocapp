import { useState } from "react";
import PayToDoctor from "./payToDoctor";
import PayToNurse from "./payToNurse";

const PayOptions = ({ paymentMethod, setShowPaymentOptions }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { label: "Doctor", value: "doctor" },
    { label: "Nurse", value: "nurse" },
  ];

  const handleSelect = (optionValue) => {
    setSelectedOption(optionValue);
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-8 text-black">
        Consult with:
      </h1>

      <div className="flex justify-center gap-6">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="bg-[#03045e] hover:bg-[#023e8a] text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition duration-200"
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedOption === "doctor" && <PayToDoctor />}
      {selectedOption === "nurse" && <PayToNurse />}
    </div>
  );
};

export default PayOptions;
