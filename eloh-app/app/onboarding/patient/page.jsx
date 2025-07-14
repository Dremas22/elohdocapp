"use client";

import PatientsRegistrationForm from "@/components/patients/PatientsRegistrationForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PatientOnboarding = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/check-registration`
        );
        const data = await res.json();

        if (!data.authenticated) {
          router.push("/sign-in?role=patient");

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
    <div className="min-h-screen bg-[#f8f9fa] px-4 py-8 sm:px-6 md:px-12 lg:px-16 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-8 md:p-16 flex flex-col md:flex-row gap-10 md:gap-12 border border-[#90e0ef]">
        {/* Left Section */}
        <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#03045e] mb-6">
            Welcome! 👋
          </h1>
          <p className="text-[#000000] text-base sm:text-lg mb-6">
            Let&apos;s get you set up to access quality healthcare and connect
            with trusted medical professionals.
          </p>

          <div className="space-y-3 text-[#000000] text-sm sm:text-base">
            {[
              "Provide your personal details to create your secure profile.",
              "Share your contact information for appointment notifications and communications.",
              "Our doctors will provide excellent care and services tailored to your needs.",
              "Manage appointments, e-consults, and prescriptions all in one secure platform.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#90e0ef] text-lg font-bold">✔</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs sm:text-sm text-[#000000] font-medium max-w-md mx-auto md:mx-0">
            Your privacy is our priority. All information is handled securely
            and in compliance with POPIA regulations.
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 mt-10 md:mt-0">
          <PatientsRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding;
