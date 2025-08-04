"use client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DoctorsList = ({ doctors, sendNotificationToDoctor }) => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full flex justify-center">
      <div
        className={`
          flex flex-wrap gap-6 justify-center items-center
          max-w-7xl px-4 py-6
        `}
      >
        {doctors.map((doc) => (
          <div
            key={doc.userId}
            title={`Consult with Dr. ${doc.fullName}`}
            onClick={() => {
              if (currentUser?.uid && doc.userId) {
                sendNotificationToDoctor(doc.userId, currentUser.uid);
                router.push(
                  `/room?staffId=${doc.userId}&patientId=${currentUser.uid}`
                );
              }
            }}
            className={`min-w-[260px] sm:min-w-[280px] md:min-w-[300px] rounded-lg p-4 shadow-md flex-shrink-0 flex flex-col items-center gap-4 transition duration-200
              ${currentUser?.uid && doc.userId
                ? "cursor-pointer bg-[#123158] hover:bg-gray-700"
                : "cursor-not-allowed bg-gray-700 opacity-50"
              }
            `}
          >
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Dr. {doc.fullName}</h3>
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
      </div>
    </div>
  );
};

export default DoctorsList;
