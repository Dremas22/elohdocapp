import NurseCollectionViewer from "./NurseCollectionViewer";
import { auth, db } from "@/db/server";
import { serializeData } from "@/lib/queries";
import { cookies } from "next/headers";
import Link from "next/link";

const NurseDashboardPage = async () => {
  const cookieStore = await cookies();
  const session = cookieStore?.get("session")?.value;

  if (!session) {
    return <p className="text-center mt-20 text-red-600">Unauthorized</p>;
  }

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const nurseSnap = await db.collection("nurses").doc(uid).get();

    if (!nurseSnap.exists) {
      return (
        <div className="text-center mt-20 text-gray-700 space-y-4">
          <p className="text-lg font-medium">Nurse not registered</p>
          <Link
            href="/"
            className="inline-block text-blue-600 hover:underline font-semibold"
          >
            Register
          </Link>
        </div>
      );
    }

    const rawNurseData = nurseSnap.data();
    const nurseData = serializeData(rawNurseData);

    let patients = [];
    if (nurseData.isVerified) {
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
        <NurseCollectionViewer userDoc={nurseData} patients={patients} />
      </div>
    );
  } catch (error) {
    console.error("Error in NursesDashboard:", error);
    return <p className="text-center mt-20 text-red-600">Server Error</p>;
  }
};

export default NurseDashboardPage;
