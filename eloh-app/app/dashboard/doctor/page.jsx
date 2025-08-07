import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";
import { serializeData } from "@/lib/queries";
import { redirect } from "next/navigation";
import Link from "next/link";

const DoctorsDashboard = async () => {
  const cookieStore = await cookies();
  const session = cookieStore?.get("session")?.value;

  if (!session) {
    return <p className="text-center mt-20 text-red-600">Unauthorized</p>;
  }

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const doctorSnap = await db.collection("doctors").doc(uid).get();

    if (!doctorSnap.exists) {
      redirect("/");
    }

    const rawDoctorData = doctorSnap.data();
    const doctorData = serializeData(rawDoctorData);

    let patients = [];
    if (doctorData.isVerified) {
      const patientsSnap = await db.collection("patients").get();
      patients = patientsSnap.docs.map((doc) => {
        return {
          id: doc.id,
          ...serializeData(doc.data()),
        };
      });
    }

    return (
      <div className="bg-gray-950 sm:p-0 sm:pr-20 p-5">
        <DoctorsCollectionViewer
          userDoc={doctorData}
          patients={patients}
          userId={uid}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in DoctorsDashboard:", error?.message);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          We encountered a server error while loading your dashboard.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }
};

export default DoctorsDashboard;
