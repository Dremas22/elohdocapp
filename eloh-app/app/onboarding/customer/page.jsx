"use client";

import CustomerRegistrationForm from "@/components/ambulance/customers/CustomerRegistrationForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CustomersOnboarding = () => {
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
          router.push("/sign-in?role=customer");
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

  // Loading State
  if (loading || !showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#90e0ef] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#03045e] text-lg font-semibold">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 px-6 py-12 sm:py-20 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-foreground rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16">
        {/* Left Content */}
        <div className="md:w-1/2 text-left md:text-left flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-4 capitalize tracking-tight leading-tight">
            Welcome, Customer
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Please complete your onboarding by providing your full name, verifying your email (auto-filled), and submitting your contact number with the correct country code.
          </p>

          <div className="space-y-4 text-base text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Enter your <strong>full name</strong> as it appears on your ID.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Confirm your <strong>email address</strong> (auto-filled and non-editable).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Select your <strong>country phone code</strong> and enter your 9-digit <strong>phone number</strong> without the country code.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                After registering, you'll be able to request ambulance services and manage your bookings easily through our platform.
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-700 font-bold">
            Your privacy is important to us. All data is handled securely in accordance with POPIA and protected using industry-standard encryption.
          </p>
        </div>

        {/* Right Form */}
        <div className="md:w-1/2">
          <CustomerRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default CustomersOnboarding;
