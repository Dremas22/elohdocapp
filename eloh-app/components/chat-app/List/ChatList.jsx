"use client";

import { db } from "@/db/client";
import { useChatStore } from "@/hooks/useChatStore";
import { useUserStore } from "@/hooks/useUserStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { FiMinus, FiPlus, FiSearch } from "react-icons/fi";
import AddUser from "./AddUser";
import { useEffect, useMemo, useState } from "react";
import { getDisplayName } from "@/lib/getDisplayName";
import CategoryFilter from "@/components/CategoryFilter";
import { doctorCategories, nurseCategories } from "@/constants";

const ChatList = ({ role }) => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { currentUser } = useUserStore();
  const { changeChat, updateUnseenCount, currentChatId } = useChatStore();

  // Prepare category options for the filter
  const { allOptions, toId } = useMemo(() => {
    const opts = [
      { id: "all", title: "All" },
      ...doctorCategories,
      ...nurseCategories,
    ];
    const map = new Map();
    [...doctorCategories, ...nurseCategories].forEach(({ id, title }) => {
      map.set(id.toLowerCase(), id);
      map.set(title.toLowerCase(), id);
    });
    return {
      allOptions: opts,
      toId: (val) => map.get(String(val || "").toLowerCase()) || null,
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.userId) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.userId),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          let user = null;
          let collectionsToCheck = [];

          if (currentUser.role === "patient") {
            const { consultations, consultationType } = currentUser;
            if (consultations && consultationType !== "none") {
              if (consultations.doctor > 0) collectionsToCheck.push("doctors");
              if (consultations.nurse > 0) collectionsToCheck.push("nurses");
            }
          } else if (
            currentUser.role === "doctor" ||
            currentUser.role === "nurse"
          ) {
            collectionsToCheck.push("patients");
          } else if (currentUser.role === "driver") {
            collectionsToCheck.push("customers");
          } else if (currentUser.role === "customer") {
            collectionsToCheck.push("drivers");
          }

          for (const col of collectionsToCheck) {
            const userDocRef = doc(db, col, item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              user = { userId: userDocSnap.id, ...userDocSnap.data() };
              break;
            }
          }

          return { ...item, user };
        });

        let chatData = await Promise.all(promises);

        // Deduplicate by chatId
        const uniqueChats = new Map();
        chatData.forEach((c) => {
          if (c?.user?.userId) {
            uniqueChats.set(c.user.userId, c);
          }
        });

        const finalChats = Array.from(uniqueChats.values()).sort(
          (a, b) => b.updatedAt - a.updatedAt
        );

        setChats(finalChats);

        // Update global unseen count in Zustand
        updateUnseenCount(finalChats);
      }
    );

    return () => unSub();
  }, [currentUser?.userId]);

  const handleSelect = async (chat) => {
    if (!chat?.user || !currentUser?.userId) return;

    // Map chats to keep only the properties stored in Firestore
    const userChats = chats.map(({ user, ...rest }) => rest);

    // Deduplicate by receiverId
    const uniqueChatsMap = new Map();
    userChats.forEach((c) => {
      if (c?.receiverId) uniqueChatsMap.set(c.receiverId, c);
    });

    // Convert back to array
    const dedupedChats = Array.from(uniqueChatsMap.values());

    // Mark the selected chat as seen
    const chatIndex = dedupedChats.findIndex((c) => c.chatId === chat.chatId);
    if (chatIndex !== -1) {
      dedupedChats[chatIndex].isSeen = true;
    }

    const userChatsRef = doc(db, "userchats", currentUser?.userId);

    try {
      await updateDoc(userChatsRef, { chats: dedupedChats });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error(err);
    }
  };


  // Get user category IDs
  const getUserCategoryIds = (user) => {
    if (!user) return [];
    const raw = user.category ?? user.categories ?? user.specialty ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr
      .map((v) => (typeof v === "string" ? v : v?.id || v?.title || ""))
      .map((v) => toId(v))
      .filter(Boolean);
  };

  // Filter chats by search input and category
  const filteredChats = useMemo(() => {
    if (!input.trim() && selectedCategory === "all") return chats;

    const needle = input.trim().toLowerCase();

    return chats.filter((c) => {
      if (!c?.user || !c?.user?.fullName) return false;

      const name = c.user.fullName.toLowerCase();
      const matchesInput = !needle || name.includes(needle);

      if (selectedCategory === "all") return matchesInput;

      const userCats = getUserCategoryIds(c.user);
      return matchesInput && userCats.includes(selectedCategory);
    });
  }, [chats, input, selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 -pl-8">

      {/* Top Bar with Search and Add/Close Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-5">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 bg-gray-800 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
          <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none border-none flex-1 text-white placeholder-gray-400 text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Add User Button */}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors mt-2 sm:mt-0"
          title="Add new users"
          onClick={() => setAddMode((prev) => !prev)}
        >
          {addMode ? <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

      </div>

      {/* Category Filter For Patients */}
      {currentUser?.role === "patient" && (
        <CategoryFilter
          options={allOptions}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          className="px-5 mb-3"
        />
      )}

      {/* Chat Items */}
      {filteredChats.map((chat) => (
        <div
          key={chat?.chatId}
          onClick={() => handleSelect(chat)}
          className={`flex items-center gap-5 p-5 cursor-pointer border-b border-gray-600 transition-colors ${chat?.isSeen
            ? "bg-transparent hover:bg-gray-800"
            : "bg-blue-600/50 hover:bg-blue-500/60"
            }`}
        >
          {/* Avatar */}
          {chat.user?.photoUrl ? (
            <img
              src={chat.user.photoUrl || "/images/default_avatar.jpg"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
              {chat?.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          {/* Username & Last Message */}
          <div className="flex flex-col gap-2">
            <span className="font-medium">
              {chat.user?.blocked?.includes(currentUser?.userId || "")
                ? "User"
                : getDisplayName(chat.user)}
            </span>
            <p className="text-sm font-light truncate">{chat?.lastMessage}</p>
          </div>
        </div>
      ))}

      {/* Add User Modal */}
      {addMode && <AddUser onClick={() => setAddMode(false)} role={role} />}
    </div>
  );
};

export default ChatList;
