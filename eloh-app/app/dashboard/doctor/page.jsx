import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";
import Link from "next/link";

// Convert Firestore Timestamps, Dates, or nested timestamp-like objects
function serializeData(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj?.toDate === "function") {
    return obj.toDate().toISOString();
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === "object") {
    if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
      return new Date(obj._seconds * 1000).toISOString();
    }

    const result = {};
    for (const key in obj) {
      result[key] = serializeData(obj[key]);
    }
    return result;
  }

  return obj;
}

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
      return (
        <div className="text-center mt-20 text-gray-700 space-y-4">
          <p className="text-lg font-medium">Doctor not registered</p>
          <Link
            href="/"
            className="inline-block text-blue-600 hover:underline font-semibold"
          >
            Register
          </Link>
        </div>
      );
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
      <div className="bg-gray-950 pr-20">
        <DoctorsCollectionViewer userDoc={doctorData} patients={patients} />
      </div>
    );
  } catch (error) {
    console.error("Error in DoctorsDashboard:", error);
    return <p className="text-center mt-20 text-red-600">Server Error</p>;
  }
};

export default DoctorsDashboard;