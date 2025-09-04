"use client";

import { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserStore } from "@/hooks/useUserStore";
import { db } from "@/db/client";
import { getDisplayName } from "@/lib/getDisplayName";

const AddUser = ({ onClick, role }) => {
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = formData.get("username")?.trim();

    if (!input) return;

    try {
      setUser(null);
      setNotFound(false);

      let collectionsToCheck = [];

      if (currentUser.role === "patient") {
        collectionsToCheck.push("doctors", "nurses");
      } else if (["doctor", "nurse"].includes(currentUser.role)) {
        collectionsToCheck.push("patients");
      } else if (currentUser.role === "driver") {
        collectionsToCheck.push("customers");
      } else if (currentUser.role === "customer") {
        collectionsToCheck.push("drivers");
      }

      let foundUser = null;
      const isEmail = input.includes("@");

      for (const col of collectionsToCheck) {
        const userRef = collection(db, col);

        let q;

        if (isEmail) {
          // 🔑 Exact match on email
          q = query(userRef, where("email", "==", input.toLowerCase()));
        } else {
          // 🔍 Case-insensitive & partial match on fullName
          const snapshot = await getDocs(userRef);
          const match = snapshot.docs.find((docSnap) => {
            const name = docSnap.data().fullName?.toLowerCase() || "";
            return name.includes(input.toLowerCase());
          });

          if (match) {
            foundUser = {
              userId: match.id,
              ...match.data(),
              collection: col,
            };
            break;
          }
        }

        if (isEmail) {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            foundUser = {
              userId: docSnap.id,
              ...docSnap.data(),
              collection: col,
            };
            break;
          }
        }
      }

      if (!foundUser) setNotFound(true);
      setUser(foundUser);
    } catch (err) {
      console.error("Error searching user:", err);
      setNotFound(true);
    }
  };

  const handleAdd = async () => {
    if (!user || !currentUser?.userId) return;

    try {
      const chatRef = collection(db, "chats");
      const userChatsRef = collection(db, "userchats");
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user?.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser?.userId,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser?.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user?.userId,
          updatedAt: Date.now(),
        }),
      });

      setUser(null); // reset search
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4 sm:p-6">
      <div className="relative bg-gray-800 rounded-xl w-full max-w-md sm:max-w-lg md:max-w-md p-6 sm:p-8">
        {/* Close Button */}
        <button
          title="Close search"
          onClick={() => onClick(false)}
          className="absolute top-3 right-3 text-red-400 hover:text-white text-lg sm:text-xl"
        >
          ✖
        </button>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5">
          <input
            type="text"
            name="username"
            placeholder="Enter user email or Full Name"
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none text-sm sm:text-base"
          />
          <button
            title="Search for other users"
            type="submit"
            className="bg-[#03045e] text-white font-semibold py-2 px-3 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
          >
            Search
          </button>
        </form>

        {notFound && (
          <p className="text-red-400 text-sm sm:text-base mb-4 text-center">
            No user found with that email or name.
          </p>
        )}

        {user && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-700 p-4 sm:p-5 rounded-lg gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {user?.photoUrl ? (
                <img
                  src={user?.photoUrl}
                  alt={user?.fullName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="text-white font-medium text-sm sm:text-base">
                {getDisplayName(user)}
              </span>
            </div>
            <button
              title={`Add ${getDisplayName(user)} to your chat list`}
              onClick={handleAdd}
              className="bg-[#03045e] text-white font-semibold py-2 px-4 sm:px-5 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
            >
              Add User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;
