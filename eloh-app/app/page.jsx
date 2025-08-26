import LandingPage from "@/components/LandingPage";
import { COLLECTIONS } from "@/constants";
import { db, auth } from "@/db/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "ElohApp | Home page",
};

export default async function Home() {
  const session = await cookies();
  const sessionCookie = session?.get("session")?.value;

  if (sessionCookie) {
    const decoded = await auth?.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    for (const col of COLLECTIONS) {
      const docSnap = await db?.collection(col).doc(userId).get();
      if (docSnap.exists) {
        const role = docSnap.data().role;

        if (role === "doctor") redirect("/dashboard/doctor");
        if (role === "nurse") redirect("/dashboard/nurse");
        if (role === "patient") redirect("/dashboard/patient");
        if (role === "driver") redirect("/dashboard/driver");
        if (role === "customer") redirect("/dashboard/customer");
        if (!COLLECTIONS.includes(`${role}s`)) redirect("/");
      }
    }
  }

  // Fallback: show landing page
  return (
    <div className="min-h-screen bg-gray-100">
      <LandingPage />
    </div>
  );
}
