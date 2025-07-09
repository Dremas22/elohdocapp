"use client";

import DoctorsRegistrationForm from "@/components/doctors/DoctorsRegistrationForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DoctorOnboarding = () => {
  const role = "doctor";

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
    <div className="min-h-screen bg-[#f8f9fa] px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10 md:p-16 flex flex-col md:flex-row gap-12 border border-[#90e0ef]">
        {/* Left Section */}
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-[#03045e] mb-6">
            Welcome, Doctor
          </h1>
          <p className="text-[#000000] text-lg mb-6">
            Let&apos;s complete your onboarding to activate your profile and
            begin practicing through our digital healthcare ecosystem.
          </p>

          <div className="space-y-4 text-[#000000] text-base">
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Submit your <strong>HPCSA-registered Practice Number</strong> to
                validate your credentials.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Select your <strong>clinical specialty</strong> to ensure
                accurate directory placement.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Provide a verified <strong>contact number</strong> for secure
                communication.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Manage appointments, e-consults, and more — all in one secure
                platform.
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-[#000000] font-medium">
            All data is processed in accordance with POPIA and industry-standard
            encryption protocols.
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="md:w-1/2 w-full">
          <div className="bg-[#f8f9fa] border border-[#90e0ef] p-8 rounded-2xl shadow-lg">
            <DoctorsRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
