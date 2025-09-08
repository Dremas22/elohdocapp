"use client";

import { db } from "@/db/client";
import { useChatStore } from "@/hooks/useChatStore";
import { useUserStore } from "@/hooks/useUserStore";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
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
  const [activeSubType, setActiveSubType] = useState("doctor");

  const { currentUser } = useUserStore();
  const { changeChat, updateUnseenCount } = useChatStore();

  const { allOptions, toId } = useMemo(() => {
    const opts = [{ id: "all", title: "All" }, ...doctorCategories, ...nurseCategories];
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
    const unsubs = [];
    let userChatsData = [];
    let defaultUsersData = [];

    const mergeAndSet = () => {
      const unique = new Map();
      defaultUsersData.forEach((u) => {
        if (u?.user?.userId) unique.set(u.user.userId, u);
      });
      userChatsData.forEach((c) => {
        if (c?.user?.userId) unique.set(c.user.userId, c);
      });
      const finalChats = Array.from(unique.values()).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      setChats(finalChats);
      updateUnseenCount(finalChats);
    };

    const unSubChats = onSnapshot(doc(db, "userchats", currentUser.userId), async (res) => {
      const items = res.data()?.chats || [];
      const chatPromises = items.map(async (item) => {
        let user = null;

        // Determine the collection to lookup
        let collectionsToCheck = [];
        if (currentUser.role === "patient") {
          if (item.receiverRole === "doctor") collectionsToCheck.push("doctors");
          if (item.receiverRole === "nurse") collectionsToCheck.push("nurses");
        } else if (["doctor", "nurse"].includes(currentUser.role)) {
          collectionsToCheck.push("patients");
        } else if (currentUser.role === "driver") collectionsToCheck.push("customers");
        else if (currentUser.role === "customer") collectionsToCheck.push("drivers");

        for (const col of collectionsToCheck) {
          const userDocSnap = await getDoc(doc(db, col, item.receiverId));
          if (userDocSnap.exists()) {
            user = { userId: userDocSnap.id, ...userDocSnap.data() };
            break;
          }
        }
        return { ...item, user };
      });

      userChatsData = await Promise.all(chatPromises);
      mergeAndSet();
    });

    unsubs.push(unSubChats);

    const collectionsToListen = [];
    if (currentUser.role === "patient") {
      const { consultations, consultationType } = currentUser;
      if (consultations && consultationType !== "none") {
        if (consultationType === "doctor" && consultations.doctor > 0) collectionsToListen.push("doctors");
        else if (consultationType === "nurse" && consultations.nurse > 0) collectionsToListen.push("nurses");
        else if (consultationType === "all") {
          if (activeSubType === "doctor" && consultations.doctor > 0) collectionsToListen.push("doctors");
          else if (activeSubType === "nurse" && consultations.nurse > 0) collectionsToListen.push("nurses");
        }
      }
    } else if (["doctor", "nurse"].includes(currentUser.role)) collectionsToListen.push("patients");
    else if (currentUser.role === "driver") collectionsToListen.push("customers");
    else if (currentUser.role === "customer") collectionsToListen.push("drivers");

    collectionsToListen.forEach((col) => {
      const unSubCol = onSnapshot(collection(db, col), (snap) => {
        defaultUsersData = snap.docs.map((docSnap) => ({
          chatId: `default-${docSnap.id}`,
          receiverId: docSnap.id,
          lastMessage: "",
          updatedAt: 0,
          isSeen: true,
          user: { userId: docSnap.id, ...docSnap.data() },
        }));
        mergeAndSet();
      });
      unsubs.push(unSubCol);
    });

    return () => unsubs.forEach((fn) => fn());
  }, [currentUser?.userId, currentUser?.role, activeSubType, updateUnseenCount]);

  const handleSelect = async (chat) => {
    if (!chat?.user || !currentUser?.userId) return;
    const userChats = chats.map(({ user, ...rest }) => rest);
    const uniqueChatsMap = new Map();
    userChats.forEach((c) => {
      if (c?.receiverId) uniqueChatsMap.set(c.receiverId, c);
    });
    const dedupedChats = Array.from(uniqueChatsMap.values());
    const chatIndex = dedupedChats.findIndex((c) => c.chatId === chat.chatId);
    if (chatIndex !== -1) dedupedChats[chatIndex].isSeen = true;
    try {
      await updateDoc(doc(db, "userchats", currentUser.userId), { chats: dedupedChats });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserCategoryIds = (user) => {
    if (!user) return [];
    const raw = user.category ?? user.categories ?? user.specialty ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr
      .map((v) => (typeof v === "string" ? v : v?.id || v?.title || ""))
      .map((v) => toId(v))
      .filter(Boolean);
  };

  const filteredChats = useMemo(() => {
    const needle = input.trim().toLowerCase();
    return chats.filter((c) => {
      if (!c?.user?.fullName) return false;
      const name = c.user.fullName.toLowerCase();
      const matchesInput = !needle || name.includes(needle);
      if (selectedCategory === "all") return matchesInput;
      const userCats = getUserCategoryIds(c.user);
      return matchesInput && userCats.includes(selectedCategory);
    });
  }, [chats, input, selectedCategory]);

  return (
    <div className="flex flex-col h-full max-h-[70vh] bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-5 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 bg-gray-800 rounded-lg px-2 sm:px-3 py-3 sm:py-2">
          <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none border-none flex-1 text-white placeholder-gray-400 text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* <div
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors mt-2 sm:mt-0"
          title="Add new users"
          onClick={() => setAddMode((prev) => !prev)}
        >
          {addMode ? <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div> */}
      </div>

      {/* Category Filter */}
      {currentUser?.role === "patient" && currentUser?.consultations && currentUser?.consultationType !== "none" && (
        <CategoryFilter
          options={allOptions}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          className="px-5 lg:mb-3 mb-1 flex-shrink-0"
        />
      )}

      {currentUser?.role === "patient" && currentUser?.consultations && currentUser?.consultationType === "all" && (
        <div className="flex gap-2 py-1.5 px-4 lg:mb-3 -mt-2 mb-1 flex-shrink-0">
          <button
            className={`shadow-[0_3px_#999] active:shadow-[0_1px_#666] active:translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg ${activeSubType === "doctor"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
              }`}
            onClick={() => setActiveSubType("doctor")}
          >
            Doctors
          </button>
          <button
            className={`shadow-[0_3px_#999] active:shadow-[0_1px_#666] active:translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg ${activeSubType === "nurse"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
              }`}
            onClick={() => setActiveSubType("nurse")}
          >
            Nurses
          </button>
        </div>

      )}

      {/* Chat List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-5 space-y-2">
        {filteredChats.map((chat) => (
          <div
            key={chat?.chatId}
            onClick={() => handleSelect(chat)}
            className={`flex items-center gap-5 p-3 sm:p-5 cursor-pointer border-b border-gray-600 transition-colors ${chat?.isSeen ? "bg-transparent hover:bg-gray-800" : "bg-blue-600/50 hover:bg-blue-500/60"
              }`}
          >
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

            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {chat.user?.blocked?.includes(currentUser?.userId || "") ? "User" : getDisplayName(chat.user)}
              </span>
              <p className="text-sm font-light truncate">{chat?.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {addMode && <AddUser onClick={() => setAddMode(false)} role={role} />}
    </div>
  );
};

export default ChatList;
