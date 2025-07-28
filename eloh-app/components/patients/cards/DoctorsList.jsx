"use client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DoctorsList = ({ doctors, sendNotificationToDoctor }) => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  return (
    <>
      {doctors.map((doc) => (
        <div
          key={doc.userId}
          onClick={() => {
            if (currentUser?.uid && doc.userId) {
              sendNotificationToDoctor(doc.userId, currentUser.uid);
              router.push(
                `/room?doctorId=${doc.userId}&patientId=${currentUser.uid}`
              );
            }
          }}
          className={`min-w-[260px] sm:min-w-[280px] md:min-w-[300px] rounded-lg p-4 shadow-md flex-shrink-0 flex flex-col items-center gap-4 transition duration-200 ${
            currentUser?.uid && doc.userId
              ? "cursor-pointer bg-[#123158] hover:bg-gray-700"
              : "cursor-not-allowed bg-gray-700 opacity-50"
          }`}
        >
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">{doc.fullName}</h3>
            <p className="text-sm text-gray-300">
              Practice No:{" "}
              <span className="font-medium">{doc.practiceNumber}</span>
            </p>
            <p className="text-sm text-gray-300">{doc.email}</p>
            <p className="text-sm text-gray-300">{doc.phoneNumber}</p>
            <p className="text-sm text-blue-400 mt-2 hover:underline">
              Click to join meeting
            </p>
          </div>
          {doc.photoUrl && (
            <Image
              src={doc.photoUrl}
              alt={doc.fullName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border border-white object-cover"
            />
          )}
        </div>
      ))}
    </>
  );
};

export default DoctorsList;
