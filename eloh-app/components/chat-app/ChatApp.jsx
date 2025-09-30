"use client";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
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
//import upload from "@/lib/uploadFile";

import VoiceCallModal from "./VoiceCallModal";
import VideoCallModal from "./VideoCallModal";

const ChatApp = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null); // use ref to avoid re-renders
  const [progressData, setProgressData] = useState(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, setChatId } =
    useChatStore();

  const endRef = useRef(null);
  const router = useRouter();

  console.log(currentUser, "USER113");

  // Scroll to bottom when messages update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Listen to chat messages
  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      if (res.exists()) {
        const data = res.data();
        setChat({
          ...data,
          messages: data.messages || [], // always array
        });
      } else {
        setChat({ messages: [] });
      }
    });
    return () => unSub();
  }, [chatId]);

  // Listen to call document for this pair (staff_patient)
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
      // no staff involved — nothing to listen for
      return;
    }

    const callId = `${staffId}_${patientId}`;
    const callDocRef = doc(db, "calls", callId);

    const unsubscribe = onSnapshot(callDocRef, (snap) => {
      if (!snap.exists()) {
        setIncomingCall(null);
        // stop ringtone if any
        if (ringtoneRef.current) {
          try {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
          } catch (e) {}
          ringtoneRef.current = null;
        }
        return;
      }

      const data = snap.data();

      // Video calls
      if (data?.type === "video") {
        if (
          data.status === "ringing" &&
          data.caller?.id !== currentUser.userId
        ) {
          setIncomingCall(data);
          if (!ringtoneRef.current) {
            const audio = new Audio("/ringtones/ringtone.mp3");
            audio.loop = true;
            audio.play().catch(() => console.error("Autoplay blocked"));
            ringtoneRef.current = audio;
          }
        } else if (["accepted", "declined"].includes(data.status)) {
          setIncomingCall(null);
          if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current = null;
          }
        }
      }

      // Voice calls
      if (data?.type === "voice") {
        if (
          data.status === "ringing" &&
          data.token &&
          data.caller?.id !== currentUser.userId
        ) {
          // 🔔 Incoming voice call
          setIncomingCall(data);

          if (!ringtoneRef.current) {
            const audio = new Audio("/ringtones/ringtone.mp3");
            audio.loop = true;
            audio.play().catch(() => console.error("Autoplay blocked"));
            ringtoneRef.current = audio;
          }
        } else if (data.status === "accepted") {
          // ✅ Keep incomingCall so VoiceCallModal shows call in progress
          setIncomingCall(data);

          if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current = null;
          }
        } else if (["declined", "ended"].includes(data.status)) {
          if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current = null;
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (ringtoneRef.current) {
        try {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        } catch (e) {}
        ringtoneRef.current = null;
      }
    };
  }, [currentUser, user]);

  // Emoji selection
  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setOpen(false);
  };

  // Handle image selection
  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous blob URL before creating a new one
    if (img?.url) {
      URL.revokeObjectURL(img.url);
    }

    setImg({ file, url: URL.createObjectURL(file) });
  };

  // Send message
  const handleSend = async () => {
    if (!text.trim() && !img.file) return;

    let imgUrl = null;
    try {
      if (img.file && currentUser?.userId) {
        //TODO: Uncomment once the firebase storage is set
        // imgUrl = await upload(img.file, currentUser?.userId, {
        //   onProgress: (uploadData) => {
        //     setProgressData(uploadData);
        //   },
        // });
      }

      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          messages: arrayUnion({
            senderId: currentUser?.userId,
            text: text.trim(),
            createdAt: new Date(),
            photoURL: currentUser?.photoUrl || "/images/default_avatar.jpg",
            ...(imgUrl && { img: imgUrl }),
          }),
        },
        { merge: true } // 👈 ensures doc exists
      );

      // Update lastMessage and isSeen in userchats
      const userIDs = [currentUser?.userId, user?.userId];
      for (const id of userIDs) {
        if (!id) continue;
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const data = userChatsSnap.data() || {};
          data.chats = data.chats || [];
          let chatIndex = data.chats.findIndex((c) => c.chatId === chatId);
          if (chatIndex >= 0) {
            data.chats[chatIndex] = {
              ...data.chats[chatIndex],
              lastMessage: text || "Image",
              isSeen: id === currentUser?.userId,
              updatedAt: Date.now(),
            };
          } else {
            data.chats.push({
              chatId,
              receiverId:
                id === currentUser.userId ? user.userId : currentUser.userId,
              lastMessage: text || "Image",
              isSeen: id === currentUser?.userId,
              updatedAt: Date.now(),
            });
          }
          await updateDoc(userChatsRef, { chats: data.chats });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setText("");
      setImg({ file: null, url: "" });
    }
  };

  // Make a video call (create call doc so receiver sees it reliably)
  const handleMakeVideoCall = async () => {
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

    const callId = `${staffId}_${patientId}`;

    try {
      // create call doc so the other side sees it
      await setDoc(
        doc(db, "calls", callId),
        {
          type: "video",
          status: "ringing",
          token: null,
          caller: {
            id: caller.userId,
            name: caller.fullName,
            photoURL: caller.photoUrl || "/images/default_avatar.jpg",
          },
          callee: {
            id: user.userId,
            name: user.fullName,
            photoURL: user.photoUrl || "/images/default_avatar.jpg",
          },
          doctorId: staffId,
          patientId,
          duration: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Send push notification (may also attempt to play audio returned)
      const audio = await sendNotificationToDoctor(staffId, patientId, {
        type: "video",
        token: null,
        duration: 0,
        caller: {
          id: caller.userId,
          name: caller.fullName,
          photoURL: caller.photoUrl || "/images/default_avatar.jpg",
        },
      });

      if (audio && !ringtoneRef.current) {
        ringtoneRef.current = audio;
        try {
          ringtoneRef.current.loop = true;
          ringtoneRef.current.play().catch(() => {});
        } catch (e) {}
      }

      router.push(`/room?staffId=${staffId}&patientId=${patientId}`);
    } catch (err) {
      console.error("Error starting call:", err);
      toastError("Failed to start the call. Please try again.");
    }
  };

  // Make a voice call
  const handleMakeVoiceCall = async () => {
    if (!currentUser || !user) return;

    let staffId = null;
    let patientId = null;

    if (["doctor", "nurse"].includes(currentUser.role)) {
      staffId = currentUser.userId;
      patientId = user.userId;
    } else if (["doctor", "nurse"].includes(user.role)) {
      staffId = user.userId;
      patientId = currentUser.userId;
    } else {
      toastError("Voice calls are only between doctors/nurses and patients.");
      return;
    }

    try {
      const room = `${staffId}_${patientId}`;
      const encodedName = encodeURIComponent(user?.fullName || `${Date.now()}`);

      // fetch LiveKit token for audio room
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/token?room=${room}&username=${encodedName}`
      );
      const { token } = await res.json();

      // create call document so receiver gets an incoming call
      const callId = `${staffId}_${patientId}`;
      const caller = currentUser;

      await setDoc(
        doc(db, "calls", callId),
        {
          type: "voice",
          status: "ringing",
          token,
          caller: {
            id: caller.userId,
            name: caller.fullName,
            photoURL: caller.photoUrl || "/images/default_avatar.jpg",
          },
          callee: {
            id: user.userId,
            name: user.fullName,
            photoURL: user.photoUrl || "/images/default_avatar.jpg",
          },
          doctorId: staffId,
          patientId,
          duration: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // notify the other user (push)
      const audio = await sendNotificationToDoctor(staffId, patientId, {
        type: "voice",
        token: token,
        duration: 0,
        caller: {
          id: currentUser.userId,
          name: currentUser.fullName,
          photoURL: currentUser.photoUrl || "/images/default_avatar.jpg",
        },
      });

      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current = null;
      }
    } catch (err) {
      console.error("Error starting voice call:", err);
      toastError("Failed to start the voice call. Please try again.");
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    const callId = `${incomingCall?.doctorId}_${incomingCall?.patientId}`;

    try {
      // Update call status in Firestore
      await updateDoc(doc(db, "calls", callId), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      // Stop ringtone if it's playing
      if (ringtoneRef.current) {
        try {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        } catch (e) {}
        ringtoneRef.current = null;
      }

      if (incomingCall?.type === "video") {
        // Redirect to LiveKit video room
        router.push(
          `/room?staffId=${incomingCall?.doctorId}&patientId=${incomingCall?.patientId}`
        );
        setIncomingCall(null);
      }
    } catch (err) {
      console.error("Error accepting call:", err);
      toastError("Failed to accept the call. Please try again.");
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    const callId = `${incomingCall?.doctorId}_${incomingCall?.patientId}`;
    await updateDoc(doc(db, "calls", callId), {
      status: "declined",
      token: null,
      updatedAt: serverTimestamp(),
    });
    if (ringtoneRef.current) {
      try {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      } catch (e) {}
      ringtoneRef.current = null;
    }
    setIncomingCall(null);
  };

  // Revoke object URL for image preview when component unmounts
  useEffect(() => {
    return () => {
      if (img?.url) URL.revokeObjectURL(img.url);
      if (ringtoneRef.current) {
        try {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        } catch (e) {}
        ringtoneRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-2 flex flex-col border-x border-gray-700 lg:h-[80vh] h-[70vh] ">
      {/* Top */}
      <div>
        <div className="border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
          {/* Back Button (absolute on mobile) */}
          <button
            onClick={() => setChatId(null)}
            className="md:hidden absolute left-2 -top-6 p-2 rounded-full bg-gray-800 hover:bg-gray-700 z-20"
          >
            <FiArrowLeft className="text-white w-5 h-5" />
          </button>

          <div className="flex justify-between items-center p-2 md:p-5">
            {/* User Info */}
            <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-0">
              <img
                src={user?.photoUrl || "/images/default_avatar.jpg"}
                alt="avatar"
                className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
              />
              <div className="flex flex-col gap-0.5 md:gap-1">
                <span className="font-semibold text-sm md:text-lg text-white">
                  {getDisplayName(user)}
                </span>
                <p className="text-xs text-gray-400 italic tracking-wide">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex gap-3 md:gap-4 text-4xl md:text-4xl">
              {!["customer", "driver"].includes(currentUser?.role) && (
                <IoVideocam
                  className="cursor-pointer hover:text-white text-[#03045e] lg:text-5xl md:text-3xl text-3xl"
                  title={`Start a video consultation with ${getDisplayName(
                    user
                  )}`}
                  onClick={handleMakeVideoCall}
                />
              )}

              <IoCall
                className="cursor-pointer text-gray-400 hover:text-white"
                title={`Start a voice call with ${getDisplayName(user)}`}
                onClick={handleMakeVoiceCall}
              />
            </div>
          </div>
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
              className="hover:text-white"
            />
          </label>
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={handleImg}
          />
          <IoMic
            title="Record voice note"
            className="cursor-pointer hover:text-white"
          />
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
          className={`flex-shrink-0 flex items-center gap-1 px-3 md:px-4 py-2 rounded-xl text-white text-sm md:text-base shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 transition-all duration-200 ease-in-out ${
            isCurrentUserBlocked || isReceiverBlocked
              ? "bg-blue-400/60 cursor-not-allowed"
              : "bg-[#03045e] hover:bg-[#023e8a] cursor-pointer"
          }`}
        >
          <span className="hidden md:inline">Send</span>
          <IoSend />
        </button>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && incomingCall?.type === "video" && (
        <VideoCallModal
          handleAcceptCall={handleAcceptCall}
          handleDeclineCall={handleDeclineCall}
          incomingCall={incomingCall}
        />
      )}

      <VoiceCallModal user={user} />
    </div>
  );
};

export default ChatApp;
