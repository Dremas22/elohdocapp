"use client";

import DoctorsRegistrationForm from "@/components/doctors/DoctorsRegistrationForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DoctorOnboarding = () => {
  const role = "doctor";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/check-registration`
        );
        const data = await res.json();

        if (!data.authenticated) {
          router.push("/sign-in?role=doctor");
          return;
        }

        if (data.registered && data.role) {
          router.push(`/dashboard/${data.role}`);
          return;
        }

        // Authenticated but not registered, show the form
        setShowForm(true);
      } catch (error) {
        console.error("Error checking registration:", error);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    // Trigger fade-in logo on mount
    setLogoVisible(true);
  }, []);

  // Custom Loading State
  if (loading || !showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#90e0ef] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#03045e] text-lg font-semibold">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-4 py-10 md:px-8 flex items-center justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-6 md:p-12 flex flex-col md:flex-row gap-12 border border-[#90e0ef]">
        {/* Left Section */}
        {/* Background Logo */}
        <img
          src="/images/elohdoc.png"
          alt="ElohDoc Logo Background"
          className={`pointer-events-none absolute top-1/2 sm:left-1/3 left-1/2 max-w-[70vh] max-h-[70vh] opacity-1 transform -translate-x-1/2 -translate-y-1/2 select-none transition-opacity duration-1000 ease-in-out ${logoVisible ? "opacity-15" : "opacity-0"
            }`}
          draggable={true}
        />
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#03045e] mb-6">
            Welcome, Doctor
          </h1>
          <p className="text-[#000000] text-base md:text-lg mb-6">
            Let&apos;s complete your onboarding to activate your profile and
            begin practicing through our digital healthcare ecosystem.
          </p>

          <div className="space-y-4 text-[#000000] text-sm md:text-base">
            {[
              "Submit your HPCSA-registered Practice Number to validate your credentials.",
              "Select your clinical specialty to ensure accurate directory placement.",
              "Provide a verified contact number for secure communication.",
              "Manage appointments, e-consults, and more — all in one secure platform.",
            ].map((text, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-[#90e0ef] text-lg font-bold">✔</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#000000] font-medium">
            All data is processed in accordance with POPIA and industry-standard
            encryption protocols.
          </p>
        </div>

        {/* Doctor Registration Form with fading background logo */}
        <div className="md:w-1/2 w-full relative overflow-hidden rounded-xl">


          {/* Form */}
          <div className="relative z-10">
            <DoctorsRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
