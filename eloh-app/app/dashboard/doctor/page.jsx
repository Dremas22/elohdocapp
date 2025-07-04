import { fetchServerCollection } from "@/lib/queries";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";
import DoctorDashboardNavbar from "@/components/navbar/doctorNav";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/db/client";

const DoctorsDashboard = async () => {
  const patients = await fetchServerCollection("patients");

  // Simulate user session; ideally use server auth or SSR
  const userId = auth?.currentUser?.uid;
  let userData = null;

  if (userId) {
    const docRef = doc(db, "doctors", userId);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      userData = userDoc.data();
    }
  }

  return (
    <div className="min-h-screen">
      <DoctorDashboardNavbar user={userData} />
      <DoctorsCollectionViewer patients={patients} />
    </div>
  );
};

export default DoctorsDashboard;
