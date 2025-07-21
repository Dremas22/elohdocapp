import GoogleSignInButton from "@/components/SignInWithGoogleBtn";
import { redirect } from "next/navigation";

const SignInPage = async ({ searchParams }) => {
  const role = (await searchParams).role;

  if (!["doctor", "nurse", "patient"].includes(role)) {
    redirect("/");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">
        <GoogleSignInButton role={role} />
        <p>Kea</p>
      </h1>
    </div>
  );
};

export default SignInPage;
