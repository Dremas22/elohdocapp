import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { serializeData } from "@/lib/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import DriverCollectionViewer from "./DriverCollectionViewer";

const DriversDashboard = async () => {
  const cookieStore = await cookies();
  const session = cookieStore?.get("session")?.value;

  if (!session) {
    return <p className="text-center mt-20 text-red-600">Unauthorized</p>;
  }

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const driverSnap = await db.collection("drivers").doc(uid).get();

    if (!driverSnap.exists) {
      redirect("/");
    }

    const rawDriverData = driverSnap.data();
    const driverData = serializeData(rawDriverData);

    let customers = [];
    if (driverData.isVerified) {
      const customersSnap = await db.collection("customers").get();
      customers = customersSnap.docs.map((doc) => {
        return {
          id: doc.id,
          ...serializeData(doc.data()),
        };
      });
    }

    return (
      <div className="bg-gray-950 sm:p-0 sm:pr-20 p-5">
        <DriverCollectionViewer
          userDoc={driverData}
          customers={customers}
          userId={uid}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in DriversDashboard:", error?.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-12">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full text-center border border-red-200">
          <div className="mb-4">
            <svg
              className="mx-auto w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered a server error while loading your dashboard. Please
            try again later.
          </p>
          <div className="relative group inline-block">
            <Link
              href="/"
              className="bg-[#03045e] text-white py-3 px-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
              Go to Homepage
            </Link>

            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Return to the homepage
            </span>
          </div>
        </div>
      </div>
    );
  }
};

export default DriversDashboard;
