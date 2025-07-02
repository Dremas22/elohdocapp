import NursesRegistrationForm from "@/components/nurses/NursesRegistrationForm";

const NurseOnboarding = () => {
  const role = "nurse";

  return (
    <div className="min-h-screen bg-background/50 px-6 py-12 sm:py-20 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-foreground rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-4 capitalize tracking-tight leading-tight">
            Welcome, Nurse
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Let&apos;s complete your onboarding to activate your profile and
            begin practicing through our digital healthcare ecosystem.
          </p>

          <div className="space-y-4 text-base text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Submit your <strong>HPCSA-registered Practice Number</strong> to
                validate your credentials.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Select your <strong>clinical specialty</strong> to ensure
                accurate directory placement.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Provide a verified <strong>contact number</strong> for secure
                communication.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✔</span>
              <span>
                Get ready to manage appointments, e-consults, and more — all in
                one secure platform.
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-700 font-bold">
            All data is processed in accordance with POPIA and industry-standard
            encryption protocols.
          </p>
        </div>

        {/* Right Form */}
        <div className="md:w-1/2">
          <NursesRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default NurseOnboarding;
