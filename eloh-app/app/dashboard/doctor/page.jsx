import { fetchServerCollection } from "@/lib/queries";
import DoctorsCollectionViewer from "./DoctorsCollectionViewer";

const DoctorsDashboard = async () => {
  const patients = await fetchServerCollection("patients");
  return (
    <div>
      <DoctorsCollectionViewer patients={patients} />
    </div>
  );
};

export default DoctorsDashboard;
