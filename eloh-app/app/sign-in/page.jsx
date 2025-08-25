import GoogleSignInButton from "@/components/SignInWithGoogleBtn";
import { redirect } from "next/navigation";

const SignInPage = async ({ searchParams }) => {
  const role = (await searchParams).role;

  if (!["doctor", "nurse", "patient", "driver", "customer"].includes(role)) {
    redirect("/");
  }

  return (
    <div className="lg:max-w-3xl max-w-2xl mx-auto p-2 ">
      <h1 className="text-2xl font-bold mb-3 mt-3 mr-15 text-blue-800">
        <GoogleSignInButton role={role} />
      </h1>
    </div>
  );
};

export default SignInPage;
