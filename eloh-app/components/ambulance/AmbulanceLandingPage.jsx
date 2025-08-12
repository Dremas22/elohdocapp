"use client";

import { useRouter } from "next/navigation";

const AmbulanceLandingPage = () => {
  const router = useRouter();

  const handleRoleClick = (role) => {
    router.push(`/sign-in?role=${role}`);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 ">
      <h1 className="text-4xl font-bold mb-4 text-amber-300">A re ye!</h1>
      <div>
        <img
          src="/images/wasalaLogo.png"
          alt="Wasala Logo"
          className="h-54 w-54 rounded-full object-cover mr-2 cursor-pointer "
        />
      </div>
      <div className="flex gap-4 mt-10">
        <button
          className="bg-[#bc6c25] hover:bg-yellow-600 text-white 
        font-semibold py-2 px-6 rounded-xl shadow-md transition duration-300 ease-in-out 
        transform hover:scale-105 cursor-pointer"
          onClick={() => handleRoleClick("driver")}
        >
          Ambulance Driver
        </button>
        <button
          className="bg-[#bc6c25] hover:bg-yellow-600 text-white 
        font-semibold py-2 px-6 rounded-xl shadow-md transition duration-300 
        ease-in-out transform hover:scale-105 cursor-pointer"
          onClick={() => handleRoleClick("customer")}
        >
          Customer
        </button>
      </div>
    </div>
  );
};

export default AmbulanceLandingPage;
