"use client";

import { useRouter } from "next/navigation";

const AmbulanceLandingPage = () => {
  const router = useRouter();

  const handleRoleClick = (role) => {
    router.push(`/sign-in?role=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#caf0f8] via-white to-[#90e0ef] px-6 relative overflow-hidden">
      {/* Logo & Tagline */}
      <div className="text-center flex flex-col items-center animate-fadeInUp">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full blur-2xl bg-[#023e8a] opacity-40 animate-pulseGlow"></div>
          <img
            src="/images/star_of_life.png"
            alt="ElohDoc Ambulance Logo"
            className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-cover shadow-xl border-4 border-[#023e8a] mb-4 hover:scale-105 transition-transform duration-300 animate-float"
          />
        </div>
        <p className="mt-3 text-lg sm:text-xl text-[#023e8a] max-w-lg font-medium tracking-wide">
          Your reliable ambulance service —{" "}
          <span className="font-semibold">fast, safe, and always ready.</span>
        </p>
      </div>

      {/* Buttons (Your style) */}
      <div className="flex flex-col sm:flex-row gap-5 mt-12 animate-fadeInUp delay-200">
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
      <footer className="absolute bottom-6 text-[#023e8a] text-sm text-center opacity-80 animate-fadeInUp delay-300">
        © {new Date().getFullYear()} ElohDoc Ambulance Services. All rights reserved.
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default AmbulanceLandingPage;
