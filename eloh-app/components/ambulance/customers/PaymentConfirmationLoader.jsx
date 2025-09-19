"use client";

import { FiLoader } from "react-icons/fi";

const PaymentConfirmationLoader = () => {
  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="p-6 rounded-lg flex flex-col items-center">
        <FiLoader className="w-20 h-20 text-gray-500 animate-spin" />
        <p className="text-gray-700 font-semibold">
          Confirming payment...Please wait
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmationLoader;
