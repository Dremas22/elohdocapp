"use client";

import { db } from "@/db/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const PatientMeetingSetup = () => {
  const { currentUser, loading } = useCurrentUser();
  const [roomID, setRoomID] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
        setError("Error fetching doctors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fullName = currentUser?.displayName || `Unknown-user_${Date.now()}`;

  // Send notification to doctor API call
  const sendNotificationToDoctor = async (doctorId, patientId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ doctorId, patientId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to send notification:", data.error);
        alert(`Error: ${data.error}`);
        return;
      }

      console.log("Notification sent successfully:", data.message);
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Something went wrong while sending the notification.");
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="w-full min-h-[50vh] bg-gray-950">
      <section className="max-w-screen-xl mx-auto px-4 py-5">
        {/* Centered Header Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-5xl">
            Virtual Medical Consultations
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-gray-300 sm:text-xl text-center">
            Connect with licensed medical professionals through secure video
            consultations from the comfort of your home.
          </p>
        </div>

        {/* Hidden Inputs (reserved for future) */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="opacity-0 h-0 overflow-hidden">
            <input
              type="text"
              id="name"
              readOnly
              value={fullName}
              className="border rounded-md px-4 py-2 w-full max-w-sm text-black bg-gray-100 cursor-not-allowed"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="flex  gap-4 mt-6">
          <div className=" items-center justify-center opacity-0 h-0 overflow-hidden">
            <input
              type="text"
              id="roomid"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="border rounded-md px-4 py-2 w-full max-w-sm text-black bg-white"
              placeholder="Enter room ID to join a meeting"
            />
            <button
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white"
              onClick={() => {
                if (currentUser?.uid && doc.userId) {
                  router.push(
                    `/room/${doc.userId}?patientId=${currentUser.uid}`
                  );
                }
              }}
              disabled={!roomID}
            >
              Join
            </button>
          </div>
        </div>

        {/* Available Doctors Section */}
        <h2 className="text-2xl font-semibold text-center mb-6 mt-16">
          Available Doctors
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500 mt-20">Loading doctors...</p>
        ) : error ? (
          <p className="text-red-600 text-center mt-20 font-semibold">
            {error}
          </p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-600 text-center mt-20 italic">
            No doctors available
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-[1300px]">
              {doctors.map((doc) => (
                <div
                  key={doc.userId}
                  onClick={() => {
                    if (currentUser?.uid && doc.userId) {
                      sendNotificationToDoctor(doc.userId, currentUser.uid);
                      router.push(
                        `/room/${doc.userId}?patientId=${currentUser.uid}`
                      );
                    }
                  }}
                  className={`rounded-lg p-4 max-w-xs shadow-md transition duration-200 flex flex-col justify-between items-center gap-4
                    ${currentUser?.uid && doc.userId
                      ? "cursor-pointer bg-[#123158] hover:bg-gray-700"
                      : "cursor-not-allowed bg-gray-700 opacity-50"
                    }
                  `}
                >
                  {/* Doctor Info */}

                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-bold text-white">{doc.fullName}</h3>
                    <p className="text-sm text-gray-300">
                      Practice No: <span className="font-medium">{doc.practiceNumber}</span>
                    </p>
                    <p className="text-sm text-gray-300">Email: {doc.email}</p>
                    <p className="text-sm text-gray-300">Phone: {doc.phoneNumber}</p>
                    <p className="text-sm text-blue-400 mt-2 hover:underline cursor-pointer">
                      Click to join meeting
                    </p>
                  </div>

                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={doc.photoUrl}
                      alt={doc.fullName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientMeetingSetup;
