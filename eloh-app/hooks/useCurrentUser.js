import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/db/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
      });

      const data = await res.json();
      alert(data.message); // Logs: "Logged out successfully"
      // Optionally redirect or update UI here
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    currentUser,
    loading,
    handleSignOut,
  };
};

export default useCurrentUser;
