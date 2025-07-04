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

  if (loading) return <p>Loading...</p>;
  if (!showForm) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10 md:p-16 flex flex-col md:flex-row gap-12 border border-[#90e0ef]">
        {/* Left Section */}
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-[#03045e] mb-6">
            Welcome! 👋
          </h1>
          <p className="text-[#000000] text-lg mb-6">
            Let&apos;s get you set up to access quality healthcare and connect
            with trusted medical professionals.
          </p>

          <div className="space-y-4 text-[#000000] text-base">
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Provide your <strong>personal details</strong> to create your
                secure profile.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Share your <strong>contact information</strong> for appointment
                notifications and communications.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Our doctors will provide{" "}
                <strong>excellent care and services</strong> tailored to your
                needs.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#90e0ef] text-lg font-bold">✔</span>
              <span>
                Manage appointments, e-consults, and prescriptions all in one
                secure platform.
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-[#000000] font-medium">
            Your privacy is our priority. All information is handled securely
            and in compliance with POPIA regulations.
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="md:w-1/2 w-full">
          <div className="bg-[#f8f9fa] border border-[#90e0ef] p-8 rounded-2xl shadow-lg">
            <PatientsRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding;
