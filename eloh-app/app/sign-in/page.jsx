import GoogleSignInButton from "@/components/SignInWithGoogleBtn";

const SignInPage = async ({ searchParams }) => {
  const role = (await searchParams).role;

  if (!["doctor", "nurse", "patient"].includes(role || "")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-medium bg-red-100 px-4 py-2 rounded-lg shadow">
          Invalid role selected. Please go back and choose a valid designation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">
        <GoogleSignInButton role={role} />
      </h1>
    </div>
  );
};

export default SignInPage;
