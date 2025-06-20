const DoctorOnboarding = () => {
  const role = "doctor";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 capitalize">
          Welcome, {role}
        </h1>
        <p className="text-gray-700 text-base">
          An onboarding form will be rendered here to collect doctor profile
          information.
        </p>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
