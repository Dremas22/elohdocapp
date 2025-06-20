"use client";
import Link from "next/link";

const ChooseDesignation = () => {
  const designations = [
    {
      id: 1,
      title: "I AM DOCTOR",
      role: "doctor",
    },

    {
      id: 2,
      title: "I AM NURSE",
      role: "nurse",
    },
    {
      id: 3,
      title: "I AM PATIENT",
      role: "patient",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 mt-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 mb-6 text-center">
        Select Your Designation
      </h2>
      <div className="grid gap-4 w-full max-w-md">
        {designations.map((designation) => (
          <Link href={`/onboarding/${designation.role}`} key={designation.id}>
            <button className="w-full py-3 px-6 bg-blue-600 text-white font-medium text-lg rounded-xl shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105">
              {designation.title}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
