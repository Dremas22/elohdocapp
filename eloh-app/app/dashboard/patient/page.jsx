import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MainPatientDashboard from "./MainPatientDashboard";
import Link from "next/link";
import { auth } from "@/db/server";

export const metadata = {
  title: "Patient Dashboard | ElohApp",
  description:
    "Access your personal dashboard on ElohApp to manage appointments, view your health details, and stay connected with your doctor.",
};

const PatientDashboard = async () => {
  const cookieStore = await cookies();
  const session = cookieStore?.get("session")?.value;

  if (!session) redirect("/sign-in?role=patient");

  try {
    const decoded = await auth?.verifySessionCookie(session, true);
    const uid = decoded.uid;

    if (!uid) redirect("/");

    return <MainPatientDashboard />;
  } catch (error) {
    console.error("Error in PatientsDashboard:", error?.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full text-center border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered a server error while loading your dashboard. Please
            try again later.
          </p>
          <Link
            href="/"
            className="bg-[#03045e] text-white py-3 px-6 text-lg font-semibold rounded-xl shadow-md hover:bg-[#023e8a] transition-all"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }
};

export default PatientDashboard;
