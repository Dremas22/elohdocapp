"use client";

import { db } from "@/db/client";
import { useChatStore } from "@/hooks/useChatStore";
import { useUserStore } from "@/hooks/useUserStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { FiMinus, FiPlus, FiSearch } from "react-icons/fi";
import AddUser from "./AddUser";
import { useEffect, useState } from "react";
import { COLLECTIONS } from "@/constants";
import { getDisplayName } from "@/lib/getDisplayName";

const ChatList = ({ role }) => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.userId) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.userId),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          let user = null;

          // Check each collection until the user is found
          for (const col of COLLECTIONS) {
            const userDocRef = doc(db, col, item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              user = { userId: userDocSnap.id, ...userDocSnap.data() };
              break; // stop checking other collections
            }
          }

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => unSub();
  }, [currentUser?.userId]);

  const handleSelect = async (chat) => {
    const userChats = chats.map(({ user, ...rest }) => rest);
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    if (!currentUser?.userId) return;

    const userChatsRef = doc(db, "userchats", currentUser?.userId);

    try {
      await updateDoc(userChatsRef, { chats: userChats });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.fullName.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      {/* Search Bar */}
      <div className="flex items-center gap-5 p-5">
        <div className="flex items-center gap-3 flex-1 bg-gray-800 rounded-lg px-3 py-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none border-none flex-1 text-white placeholder-gray-400"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div
          className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => setAddMode((prev) => !prev)}
        >
          {addMode ? (
            <FiMinus className="w-5 h-5" onClick={() => setAddMode(false)} />
          ) : (
            <FiPlus className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Chat Items */}
      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          className={`flex items-center gap-5 p-5 cursor-pointer border-b border-gray-600 transition-colors ${
            chat?.isSeen
              ? "bg-transparent hover:bg-gray-800"
              : "bg-blue-600/50 hover:bg-blue-500/60"
          }`}
        >
          {/* Avatar */}
          {chat.user?.photoUrl &&
          !chat.user?.blocked.includes(
            chat?.user?.userId || "deafult_avatar.jpg"
          ) ? (
            <img
              src={chat?.user?.photoUrl || "/images/deafult_avatar.jpg"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
              {chat?.user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          {/* Username & Last Message */}
          <div className="flex flex-col gap-2">
            <span className="font-medium">
              {chat.user.blocked.includes(currentUser?.userId || "")
                ? "User"
                : getDisplayName(chat.user)}
            </span>
            <p className="text-sm font-light truncate">{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {/* Add User Modal */}
      {addMode && <AddUser onClick={() => setAddMode(false)} role={role} />}
    </div>
  );
};

export default ChatList;
