"use client";

import Image from "next/image";
import { FaUserNurse, FaSyringe, FaNotesMedical } from "react-icons/fa";

const nursePackages = [
  {
    subscriptionName: "1 Nurse consultation",
    title: "1 Consultation",
    description:
      "Access to once-off consultation, nurse prescription and sick note.",
    price: "R200",
    icon: <FaUserNurse className="text-5xl  text-[#03045e]" />,
  },
  {
    subscriptionName: "2 Nurse consultations",
    title: "2 Consultations",
    description:
      "Access to 2 consultations, nurse prescriptions and sick notes.",
    price: "R400",
    icon: <FaSyringe className="text-5xl sm:scale-600 text-[#03045e]" />,
  },
  {
    subscriptionName: "3 Nurse consultations",
    title: "3 Consultations",
    description:
      "Access to 3 consultations, nurse prescriptions and sick notes.",
    price: "R600",
    icon: <FaNotesMedical className="text-5xl sm:scale-500 text-[#03045e]" />,
  },
];

const PayToNurse = ({ setSelectedPackage }) => {
  return (
    <div className="text-black px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-10 text-center text-[#03045e]">
        Choose a Nurse Consultation Package
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {nursePackages.map((pkg, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-200 p-6 rounded-2xl shadow-md flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute top-4 right-4 border border-gray-400 rounded-full">
              <Image
                src="/images/elohdoc.png"
                alt="ElohDoc Logo"
                width={40}
                height={40}
                className="rounded-full object-contain"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              {pkg.icon}
              <h3 className="text-xl font-semibold text-[#03045e]">{pkg.title}</h3>
            </div>

            <p className="text-gray-700 text-sm flex-1">{pkg.description}</p>

            <button
              onClick={() => {
                setSelectedPackage(pkg);
              }}
              className="mt-6 bg-[#03045e] text-white py-3 text-lg sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
              {pkg.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayToNurse;
