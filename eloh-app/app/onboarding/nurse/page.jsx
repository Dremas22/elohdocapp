const NurseOnboarding = () => {
  const role = "nurse";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-4 capitalize">
          Welcome, {role}
        </h1>
        <p className="text-gray-700 text-base">
          An onboarding form will be rendered here to register nurse credentials
          and work details.
        </p>
      </div>
    </div>
  );
};

export default NurseOnboarding;
