import LandingPage from "@/components/LandingPage";
import { db, auth } from "@/db/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await cookies();
  const sessionCookie = session?.get("session")?.value;

  if (sessionCookie) {
    const decoded = await auth?.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    const collections = ["doctors", "nurses", "patients"];

    for (const col of collections) {
      const docSnap = await db.collection(col).doc(userId).get();
      if (docSnap.exists) {
        const role = docSnap.data().role;

        if (role === "doctor") redirect("/dashboard/doctor");
        if (role === "nurse") redirect("/dashboard/nurse");
        if (role === "patient") redirect("/dashboard/patient");
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
