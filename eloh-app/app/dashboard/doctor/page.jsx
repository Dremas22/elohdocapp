import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";
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

    const doctorDataRaw = doctorSnap.data();

    // ✅ Convert Firestore Timestamps to plain JS values
    const convertTimestamp = (timestamp) => {
      if (!timestamp) return null;
      if (typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      // If it's a string or unknown format, try new Date conversion
      try {
        return new Date(timestamp).toISOString();
      } catch {
        return null;
      }
    };

    const doctorData = {
      ...doctorDataRaw,
      createdAt: convertTimestamp(doctorDataRaw.createdAt),
      updatedAt: convertTimestamp(doctorDataRaw.updatedAt),
    };

    let patients = [];
    if (doctorData.isVerified) {
      const patientsSnap = await db.collection("patients").get();
      patients = patientsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate().toISOString() || null,
          updatedAt: data.updatedAt?.toDate().toISOString() || null,
          id: doc.id,
        };
      });
    }

    return (
      <div>
        <DoctorsCollectionViewer userDoc={doctorData} patients={patients} />
      </div>
    );
  } catch (error) {
    console.error("Error in DoctorsDashboard:", error);
    return <p className="text-center mt-20 text-red-600">Server Error</p>;
  }
};

export default DoctorsDashboard;
