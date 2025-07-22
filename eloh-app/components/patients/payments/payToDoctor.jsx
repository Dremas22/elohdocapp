"use client";

import Image from "next/image";
import { FaStethoscope, FaNotesMedical, FaUserMd } from "react-icons/fa";

const doctorPackages = [
  {
    subscriptionName: "1 Doctor consultation",
    title: "1 Consultation",
    description:
      "Access to once-off consultation, doctor prescription and sick note.",
    price: "R500",
    icon: <FaStethoscope className="text-5xl sm:scale-130 text-[#03045e]" />,
  },
  {
    subscriptionName: "2 Doctor consultations",
    title: "2 Consultations",
    description:
      "Access to 2 consultations, doctor prescriptions and sick notes.",
    price: "R1000",
    icon: <FaNotesMedical className="text-5xl sm:scale-500 text-[#03045e]" />,
  },
  {
    subscriptionName: "3 Doctor consultations",
    title: "3 Consultations",
    description:
      "Access to 3 consultations, doctor prescriptions and sick notes.",
    price: "R1500",
    icon: <FaUserMd className="text-5xl sm:scale-500 text-[#03045e]" />,
  },
];

const PayToDoctor = ({ setSelectedPackage }) => {
  return (
    <div className="text-black px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-10 text-center text-[#03045e]">
        Choose a Doctor Consultation Package
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctorPackages.map((pkg, index) => (
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
              className="mt-6 bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
              {pkg.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayToDoctor;
