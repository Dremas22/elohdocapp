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
import { COLLECTIONS } from "@/constants";
import { getDisplayName } from "@/lib/getDisplayName";

const AddUser = ({ onClick, role }) => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");

    if (!username) return;

    try {
      let foundUser = null;

      for (const col of COLLECTIONS) {
        const userRef = collection(db, col);
        const q = query(userRef, where("fullName", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          foundUser = {
            userId: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
            collection: col,
          };
          break; // stop once we find the user
        }
      }

      setUser(foundUser || null);
    } catch (err) {
      console.error("Error searching user:", err);
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

      await updateDoc(doc(userChatsRef, user.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.userId,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.userId,
          updatedAt: Date.now(),
        }),
      });

      setUser(null); // reset search
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="relative bg-gray-800 p-8 rounded-lg w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={() => onClick(false)}
          className="absolute top-3 right-3 text-red-400 hover:text-white hover:cursor-pointer"
        >
          ✖
        </button>

        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Search
          </button>
        </form>

        {user && (
          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="text-white font-medium">
                {getDisplayName(user)}
              </span>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
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
