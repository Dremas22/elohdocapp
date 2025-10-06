import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";
import { serializeData } from "@/lib/queries";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Doctor Dashboard | ElohApp",
  description:
    "Access your doctor dashboard on ElohApp to manage patients, view details, and stay connected.",
};

const DoctorsDashboard = async () => {
  const cookieStore = await cookies();
  const session = cookieStore?.get("session")?.value;

  if (!session) redirect("/sign-in?role=doctor");

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const doctorSnap = await db.collection("doctors").doc(uid).get();
    if (!doctorSnap.exists) redirect("/");

    const doctorData = serializeData(doctorSnap.data());

    let patients = [];
    if (doctorData.isVerified) {
      const patientsSnap = await db.collection("patients").get();
      patients = patientsSnap.docs.map((doc) => ({
        id: doc.id,
        ...serializeData(doc.data()),
      }));
    }

    // Pass all data to the collection viewer
    return (
      <DoctorsCollectionViewer
        userDoc={doctorData}
        patients={patients}
        userId={uid}
      />
    );
  } catch (error) {
    console.error("Error in DoctorsDashboard:", error?.message);
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

export default DoctorsDashboard;
