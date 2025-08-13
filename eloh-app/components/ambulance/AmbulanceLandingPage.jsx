"use client";

import { useRouter } from "next/navigation";

const AmbulanceLandingPage = () => {
  const router = useRouter();

  const handleRoleClick = (role) => {
    router.push(`/sign-in?role=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#caf0f8] via-white to-[#90e0ef] px-6">
      {/* Logo & Title */}
      <div className="text-center">
        <div className="flex flex-col items-center">
          <img
            src="/images/wasalaLogo.png"
            alt="ElohDoc Ambulance Logo"
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover shadow-lg border-4 border-[#023e8a] mb-6"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#03045e] drop-shadow-sm">
            A re ye!
          </h1>
          <p className="mt-3 text-lg text-[#023e8a] max-w-md">
            Your reliable ambulance service — fast, safe, and always ready.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-5 mt-12">
        <button
          onClick={() => handleRoleClick("driver")}
          className="bg-[#03045e] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
        >
          Ambulance Driver
        </button>
        <button
          onClick={() => handleRoleClick("customer")}
          className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
        >
          Customer
        </button>
      </div>

      {/* Footer note */}
      <div className="absolute bottom-6 text-[#023e8a] text-sm">
        © {new Date().getFullYear()} ElohDoc Ambulance Services
      </div>
    </div>
  );
};

export default AmbulanceLandingPage;



