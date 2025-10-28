"use client";

import { db } from "@/db/client";
import { useChatStore } from "@/hooks/useChatStore";
import { useUserStore } from "@/hooks/useUserStore";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { FiSearch } from "react-icons/fi";
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

    const unsubs = [];
    let userChatsData = [];
    let defaultUsersData = [];

    const asMillis = (val) => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      if (val?.toMillis) return val.toMillis();
      const parsed = Date.parse(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const mergeAndSet = () => {
      const isDriver = currentUser.role === "driver";
      const isCustomer = currentUser.role === "customer";
      const unique = new Map();

      // 🧭 For drivers and customers → only show trip-based users
      if (isDriver || isCustomer) {
        defaultUsersData.forEach((u) => {
          if (u?.user?.userId) unique.set(u.user.userId, u);
        });

        let finalChats = Array.from(unique.values());
        finalChats.sort(
          (a, b) => asMillis(b.updatedAt) - asMillis(a.updatedAt)
        );

        setChats(finalChats);
        updateUnseenCount(finalChats);
        return;
      }

      // 🧩 Everyone else (patients, doctors, nurses, etc.)
      // Filter userChatsData for patients/customers to remove unavailable staff
      const filteredUserChatsData =
        currentUser.role === "patient" || currentUser.role === "customer"
          ? userChatsData.filter((c) => c.user?.available !== false)
          : userChatsData;

      // Merge defaultUsersData (default visible users)
      defaultUsersData.forEach((u) => {
        if (u?.user?.userId) unique.set(u.user.userId, u);
      });

      // Merge filteredUserChatsData (chat history + unseen messages)
      filteredUserChatsData.forEach((c) => {
        if (c?.user?.userId) unique.set(c.user.userId, c);
      });

      let finalChats = Array.from(unique.values());

      // 🔹 Apply active subtype filtering for patients viewing all staff
      if (
        currentUser.role === "patient" &&
        currentUser.consultationType === "all"
      ) {
        finalChats = finalChats.filter((c) => {
          if (activeSubType === "doctor") return c.user?.role === "doctor";
          if (activeSubType === "nurse") return c.user?.role === "nurse";
          return true;
        });
      }

      // Sort chats by recent activity
      finalChats.sort((a, b) => asMillis(b.updatedAt) - asMillis(a.updatedAt));

      setChats(finalChats);
      updateUnseenCount(finalChats);
    };

    // 🔹 Listen to the current user's chats
    const unSubChats = onSnapshot(
      doc(db, "userchats", currentUser.userId),
      async (res) => {
        const items = res.exists() ? res.data()?.chats || [] : [];

        if (!items.length) {
          userChatsData = [];
          mergeAndSet();
          return;
        }

        const chatPromises = items.map(async (item) => {
          let user = null;
          let collectionsToCheck = [];

          switch (currentUser.role) {
            case "patient":
              collectionsToCheck = ["doctors", "nurses"];
              break;
            case "doctor":
            case "nurse":
              collectionsToCheck = ["patients"];
              break;
            case "driver":
              collectionsToCheck = ["customers"];
              break;
            case "customer":
              collectionsToCheck = ["drivers"];
              break;
            default:
              collectionsToCheck = [
                "doctors",
                "nurses",
                "patients",
                "drivers",
                "customers",
              ];
          }

          for (const col of collectionsToCheck) {
            try {
              const userDocSnap = await getDoc(doc(db, col, item.receiverId));
              if (userDocSnap.exists()) {
                user = { userId: userDocSnap.id, ...userDocSnap.data() };
                break;
              }
            } catch (err) {
              console.error(
                "Error fetching user doc",
                col,
                item.receiverId,
                err
              );
            }
          }

          return { ...item, user };
        });

        userChatsData = await Promise.all(chatPromises);
        mergeAndSet();
      }
    );

    unsubs.push(unSubChats);

    // 🔹 Default listeners (fallback users)
    const collectionsToListen = [];

    if (currentUser.role === "patient") {
      const consultations = currentUser.consultations ?? {};
      const consultationType = currentUser.consultationType ?? "none";

      if (consultationType === "doctor" && consultations.doctor > 0) {
        collectionsToListen.push("doctors");
      } else if (consultationType === "nurse" && consultations.nurse > 0) {
        collectionsToListen.push("nurses");
      } else if (consultationType === "all") {
        // ✅ Respect activeSubType toggle
        if (activeSubType === "doctor" && consultations.doctor > 0) {
          collectionsToListen.push("doctors");
        }
        if (activeSubType === "nurse" && consultations.nurse > 0) {
          collectionsToListen.push("nurses");
        }
      }
    } else if (["doctor", "nurse"].includes(currentUser.role)) {
      collectionsToListen.push("patients");
    } else if (
      currentUser.role === "driver" ||
      currentUser.role === "customer"
    ) {
      // 🔹 Special trip-based chat visibility for drivers & customers
      const tripsRef = collection(db, "trips");
      const tripField =
        currentUser.role === "driver" ? "driverId" : "customerId";

      const activeTripQuery = query(
        tripsRef,
        where(tripField, "==", currentUser.userId),
        where("status", "==", "accepted")
      );

      const unSubTrip = onSnapshot(activeTripQuery, async (snap) => {
        if (snap.empty) {
          // No active trips → clear default users
          defaultUsersData = [];
          mergeAndSet();
          return;
        }

        const tripDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const otherRole =
          currentUser.role === "driver" ? "customers" : "drivers";

        // Fetch corresponding users from the opposite role
        const userPromises = tripDocs.map(async (trip) => {
          const otherUserId =
            currentUser.role === "driver" ? trip.customerId : trip.driverId;
          if (!otherUserId) return null;

          const otherUserDoc = await getDoc(doc(db, otherRole, otherUserId));
          if (!otherUserDoc.exists()) return null;

          const otherUser = {
            userId: otherUserDoc.id,
            ...otherUserDoc.data(),
          };

          return {
            chatId: `${currentUser.userId}_${otherUserId}`,
            receiverId: otherUserId,
            lastMessage: "",
            updatedAt: new Date(),
            isSeen: true,
            user: otherUser,
          };
        });

        const tripUsers = (await Promise.all(userPromises)).filter(Boolean);
        defaultUsersData = tripUsers;
        mergeAndSet();
      });

      unsubs.push(unSubTrip);
    }

    collectionsToListen.forEach((col) => {
      let q;

      if (currentUser?.role === "patient") {
        // ✅ Patients only see available staff
        if (col === "doctors" || col === "nurses") {
          q = query(collection(db, col), where("available", "==", true));
        } else {
          q = collection(db, col);
        }
      } else {
        q = collection(db, col);
      }

      const unSubCol = onSnapshot(q, (snap) => {
        defaultUsersData = snap.docs.map((docSnap) => ({
          chatId: docSnap.id,
          receiverId: docSnap.id,
          lastMessage: "",
          updatedAt: new Date(),
          isSeen: true,
          user: { userId: docSnap.id, ...docSnap.data() },
        }));
        mergeAndSet();
      });

      unsubs.push(unSubCol);
    });

    return () => unsubs.forEach((fn) => fn());
  }, [
    currentUser?.userId,
    currentUser?.role,
    activeSubType,
    updateUnseenCount,
  ]);

  const handleSelect = async (chat) => {
    if (!chat?.user || !currentUser?.userId) return;

    const userChats = chats.map(({ user, ...rest }) => ({
      ...rest,
      receiverId: rest.receiverId,
    }));

    const uniqueChatsMap = new Map();
    userChats.forEach((c) => {
      if (c?.receiverId) uniqueChatsMap.set(c.receiverId, c);
    });

    const dedupedChats = Array.from(uniqueChatsMap.values());
    const chatIndex = dedupedChats.findIndex((c) => c.chatId === chat.chatId);
    if (chatIndex !== -1) dedupedChats[chatIndex].isSeen = true;

    try {
      await setDoc(
        doc(db, "userchats", currentUser.userId),
        { chats: dedupedChats },
        { merge: true }
      );

      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Error updating chats:", err);
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
    <div className="p-2 flex flex-col h-full max-h-[70vh] bg-gray-900 text-white rounded-lg overflow-hidden">
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
      </div>

      {/* Category Filter (patients only) */}
      {currentUser?.role === "patient" &&
        currentUser?.consultations &&
        currentUser?.consultationType !== "none" && (
          <CategoryFilter
            options={allOptions}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            className="px-5 lg:mb-3 mb-1 flex-shrink-0"
          />
        )}

      {currentUser?.role === "patient" &&
        currentUser?.consultations &&
        currentUser?.consultationType === "all" && (
          <div className="flex gap-2 py-1.5 px-4 lg:mb-3 -mt-2 mb-1 flex-shrink-0">
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${
                activeSubType === "doctor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setActiveSubType("doctor")}
            >
              Doctors
            </button>
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer ${
                activeSubType === "nurse"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setActiveSubType("nurse")}
            >
              Nurses
            </button>
          </div>
        )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-5 space-y-2">
        {filteredChats.map((chat) => (
          <div
            key={chat?.chatId}
            onClick={() => handleSelect(chat)}
            className={`flex items-center gap-5 p-3 sm:p-5 cursor-pointer border-b border-gray-600 transition-colors ${
              chat?.isSeen
                ? "bg-transparent hover:bg-gray-800"
                : "bg-blue-600/50 hover:bg-blue-500/60"
            }`}
          >
            {chat.user?.photoUrl ? (
              <img
                src={chat.user.photoUrl || "/images/default_avatar.jpg"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                {chat?.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {chat.user?.blocked?.includes(currentUser?.userId || "")
                  ? "User"
                  : getDisplayName(chat.user)}
              </span>
              <p className="text-sm font-light truncate">{chat?.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      {addMode && <AddUser onClick={() => setAddMode(false)} role={role} />}
    </div>
  );
};

export default ChatList;
