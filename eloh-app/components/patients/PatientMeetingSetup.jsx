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
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(null);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
        setError("Error fetching doctors:");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fullName = currentUser?.displayName || `Unknown-user_${Date.now()}`;

  return (
    <div className="w-full min-h-screen bg-gray-950 text-white">
      <section className="max-w-screen-xl mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-5xl">
            Virtual Medical Consultations
          </h1>
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text font-extrabold text-transparent text-5xl mt-2">
            <span className="block">Talk to a Doctor Online</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl sm:text-xl/relaxed text-gray-300">
            Connect with licensed medical professionals through secure video
            consultations from the comfort of your home.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <input
              type="text"
              id="name"
              readOnly
              value={fullName}
              className="border rounded-md px-4 py-2 w-full max-w-sm text-black bg-gray-100 cursor-not-allowed"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="opacity-0 h-0 overflow-hidden">
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
                onClick={() => router.push(`/room/${roomID}`)}
                disabled={!roomID}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Available Doctors
          </h2>
          {loading || isLoading ? (
            <p className="text-center text-gray-500 mt-20">
              Loading doctors...
            </p>
          ) : error ? (
            <p className="text-red-600 text-center mt-20 font-semibold">
              {error}
            </p>
          ) : doctors.length === 0 ? (
            <p className="text-gray-600 text-center mt-20 italic">
              No doctors available
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.userId}
                  onClick={() => {
                    if (!loading && !isLoading) {
                      router.push(`/room/${doc.userId}`);
                    }
                  }}
                  className={`rounded-lg p-5 shadow-md transition duration-200 flex justify-between items-center gap-4 ${loading || isLoading
                      ? "cursor-not-allowed bg-gray-700 opacity-60"
                      : "cursor-pointer bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                  {/* Left - Text Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {doc.fullName}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Practice No:{" "}
                      <span className="font-medium">{doc.practiceNumber}</span>
                    </p>
                    <p className="text-sm text-gray-300">Email: {doc.email}</p>
                    <p className="text-sm text-gray-300">
                      Phone: {doc.phoneNumber}
                    </p>
                    <p className="text-sm text-blue-400 mt-2 hover:underline">
                      Click to join meeting
                    </p>
                  </div>

                  {/* Right - Image */}
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
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientMeetingSetup;
