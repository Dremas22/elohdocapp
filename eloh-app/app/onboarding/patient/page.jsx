const PatientOnboarding = () => {
  const role = "patient";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4 capitalize">
          Welcome, {role}
        </h1>
        <p className="text-gray-700 text-base">
          An onboarding form will be rendered here to set up patient preferences
          and details.
        </p>
      </div>
    </div>
  );
};

export default PatientOnboarding;
