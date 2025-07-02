import { fetchServerCollection } from "@/lib/queries";
import NurseCollectionViewer from "./NurseCollectionViewer";

const NurseDashboard = async () => {
  const patients = await fetchServerCollection("patients");
  return (
    <div>
      <NurseCollectionViewer patients={patients} />
    </div>
  );
};

export default NurseDashboard;
