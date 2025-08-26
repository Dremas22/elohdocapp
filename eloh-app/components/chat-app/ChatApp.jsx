"use client";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { MdOutlinePhoneCallback } from "react-icons/md";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";
import {
  arrayUnion, doc, getDoc,
  onSnapshot, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { useUserStore } from "@/hooks/useUserStore";
import { useChatStore } from "@/hooks/useChatStore";
import { db } from "@/db/client";
import { IoCall, IoVideocam, IoSend, IoImage, IoMic } from "react-icons/io5";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { FiArrowLeft } from "react-icons/fi";
import ChatMessage from "./ChatMessage";
import { getDisplayName } from "@/lib/getDisplayName";
import { sendNotificationToDoctor } from "@/lib/sendNotificationToStaff";
import { toastError } from "@/helpers/toastHelper";
import { useRouter } from "next/navigation";
import upload from "@/lib/uploadFile";

const ChatApp = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [incomingCall, setIncomingCall] = useState(null);
  const [calling, setCalling] = useState(false);
  const [ringtone, setRingtone] = useState(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, setChatId } =
    useChatStore();

  const endRef = useRef(null);
  const router = useRouter();

  // Scroll to bottom when messages update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Listen to chat messages
  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      if (res.exists()) setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  useEffect(() => {
    if (!currentUser || !user) return;

    // Determine staff vs patient for callId
    let staffId;
    let patientId;

    if (["doctor", "nurse"].includes(currentUser.role)) {
      staffId = currentUser.userId;
      patientId = user.userId;
    } else if (["doctor", "nurse"].includes(user.role)) {
      staffId = user.userId;
      patientId = currentUser.userId;
    } else {
      console.warn("Video calls must involve a doctor/nurse and a patient");
      return;
    }

    const callId = `${staffId}_${patientId}`;

    const callDocRef = doc(db, "calls", callId);

    const unsubscribe = onSnapshot(callDocRef, (snap) => {
      if (!snap.exists()) return setIncomingCall(null);

      const data = snap.data();


      if (
        data?.status === "ringing" &&
        data?.caller?.id !== currentUser?.userId
      ) {
        setIncomingCall(data);
        if (!ringtone) {
          const audio = new Audio("/ringtones/ringtone.mp3");
          audio.loop = true;
          audio.play().catch(() => console.error("Autoplay blocked"));
          setRingtone(audio);
        }
      } else if (data?.status === "accepted" || data?.status === "declined") {
        if (ringtone) {
          ringtone.pause();
          ringtone.currentTime = 0;
          setRingtone(null);
        }
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.userId, user?.userId]);

  // Emoji selection
  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setOpen(false);
  };

  // Handle image selection
  const handleImg = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // Send message
  const handleSend = async () => {
    if (!text.trim() && !img.file) return;

    let imgUrl = null;
    try {
      if (img.file) {
        // TODO: implement your upload function
        //imgUrl = await upload(img.file);
      }

      if (chatId) {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser?.userId,
            text,
            createdAt: new Date(),
            photoURL: currentUser?.photoUrl || "/images/default_avatar.jpg",
            ...(imgUrl && { img: imgUrl }),
          }),
        });
      }

      // Update lastMessage and isSeen in userchats
      const userIDs = [currentUser?.userId, user?.userId];
      for (const id of userIDs) {
        if (!id) continue;
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const data = userChatsSnap.data();
          const chatIndex = data.chats.findIndex((c) => c.chatId === chatId);
          if (chatIndex >= 0) {
            data.chats[chatIndex].lastMessage = text || "Image";
            data.chats[chatIndex].isSeen = id === currentUser?.userId;
            data.chats[chatIndex].updatedAt = Date.now();
            await updateDoc(userChatsRef, { chats: data.chats });
          }
        }
      }
    } catch (err) {

    } finally {
      setText("");
      setImg({ file: null, url: "" });
    }
  };

  // Make a video call
  const handleMakeCall = async () => {
    if (!currentUser || !user) return;

    let staffId = null;
    let patientId = null;
    const caller = currentUser;

    if (["doctor", "nurse"].includes(currentUser.role)) {
      staffId = currentUser.userId;
      patientId = user.userId;
    } else if (["doctor", "nurse"].includes(user.role)) {
      staffId = user.userId;
      patientId = currentUser.userId;
    } else {
      toastError(
        "Video calls can only be initiated between a doctor/nurse and a patient."
      );
      return;
    }

    try {
      // Send push notification
      const audio = await sendNotificationToDoctor(staffId, patientId, {
        type: "incoming-call",
        caller: {
          id: caller.userId,
          name: caller.fullName,
          photoUrl: caller.photoUrl || "/images/default_avatar.jpg",
        },
      });

      // Play ringtone if audio returned
      if (audio) {
        setRingtone(audio);
      }

      router.push(`/room?staffId=${staffId}&patientId=${patientId}`);
      setCalling(true);
    } catch (err) {
      console.error("Error starting call:", err);
      toastError("Failed to start the call. Please try again.");
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const callId = `${incomingCall?.doctorId}_${incomingCall?.patientId}`;
    await updateDoc(doc(db, "calls", callId), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
      setRingtone(null);
    }
    router.push(
      `/room?staffId=${incomingCall?.doctorId}&patientId=${incomingCall?.patientId}`
    );

  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    const callId = `${incomingCall?.doctorId}_${incomingCall?.patientId}`;
    await updateDoc(doc(db, "calls", callId), {
      status: "declined",
      updatedAt: serverTimestamp(),
    });
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
      setRingtone(null);
    }
    setIncomingCall(null);
  };

  return (
    <div className="flex-2 flex  flex-col border-x border-gray-700 h-full  ">
      {/* Top */}
      <div className="flex justify-between items-center p-2 md:p-5 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 ">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setChatId(null)}
            className="md:hidden p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <FiArrowLeft className="text-white w-5 h-5" />
          </button>
          <img
            src={user?.photoUrl || "/images/default_avatar.jpg"}
            alt="avatar"
            className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
          />
          <div className="flex flex-col gap-0.5 md:gap-1">
            <span className="lg:font-semibold text-sm md:text-lg text-white">
              {getDisplayName(user)}
            </span>
            <p className="text-xs text-gray-400 italic tracking-wide">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 text-gray-400 text-lg md:text-xl">
          <a href={`tel:${user?.phoneNumber}`}>
            <IoCall className="cursor-pointer hover:text-white" />
          </a>
          <IoVideocam
            className="cursor-pointer hover:text-white"
            onClick={handleMakeCall}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col p-3 md:p-5 gap-3 md:gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
        {chat.messages.map((message, idx) => (
          <ChatMessage key={idx} message={message} currentUser={currentUser} />
        ))}
        {img.url && (
          <div className="self-end max-w-[70%]">
            <img
              src={img.url}
              alt="preview"
              className="w-full max-h-52 md:max-h-72 rounded-lg object-cover"
            />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Bottom Input */}
      <div className="flex items-center gap-2 md:gap-4 p-3 md:p-5 border-t border-gray-700">
        <div className="flex gap-2 md:gap-3 text-gray-400 text-lg md:text-xl flex-shrink-0">
          <label htmlFor="file" className="cursor-pointer">
            <IoImage
              title="Select digital files"
              className="hover:text-white" />
          </label>
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={handleImg}
          />
          <IoMic
            title="Record voice note"
            className="cursor-pointer hover:text-white" />
          <div className="relative text-lg md:text-xl text-gray-400 flex-shrink-0">
            <HiOutlineEmojiHappy
              title="Select Imoji"
              className="cursor-pointer hover:text-white"
              onClick={() => setOpen((prev) => !prev)}
            />
            {open && (
              <div className="absolute bottom-10 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="flex-1 min-w-0 p-2 md:p-3 rounded-lg bg-gray-700 text-white outline-none placeholder-gray-400 disabled:cursor-not-allowed text-sm md:text-base lg:text-xl"
        />

        <button
          title="Send message"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className={`flex-shrink-0 flex items-center gap-1 px-3 md:px-4 py-2 rounded-xl text-white text-sm md:text-base shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 transition-all duration-200 ease-in-out ${isCurrentUserBlocked || isReceiverBlocked
            ? "bg-blue-400/60 cursor-not-allowed"
            : "bg-[#03045e] hover:bg-[#023e8a] cursor-pointer"}
            }`}

        >
          Send
          <IoSend />
        </button>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl flex flex-col items-center gap-4 w-80">
            <h2 className="text-white text-lg font-semibold">Incoming Call</h2>
            <p className="text-gray-300 text-center">
              {incomingCall.caller.name} is calling you
            </p>
            <div className="flex gap-4 mt-4">

              <button
                title="Click to accept the call"
                onClick={handleAcceptCall}
                className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
              >
                <MdOutlinePhoneCallback className="w-5 h-5 text-green-500" />
              </button>

              <button
                title="Click to decline the call"
                onClick={handleDeclineCall}
                className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
              >
                <HiOutlinePhoneMissedCall className="w-5 h-5 text-red-500" />
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
