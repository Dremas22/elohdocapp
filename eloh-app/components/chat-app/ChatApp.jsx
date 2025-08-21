"use client";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { useUserStore } from "@/hooks/useUserStore";
import { useChatStore } from "@/hooks/useChatStore";
import { db } from "@/db/client";

import {
  IoCall,
  IoVideocam,
  IoInformationCircle,
  IoSend,
  IoImage,
  IoMic,
} from "react-icons/io5";
import { HiOutlineEmojiHappy, HiOutlineCamera } from "react-icons/hi";
//import upload from "@/lib/uploadFile";
import ChatMessage from "./ChatMessage";
import { getDisplayName } from "@/lib/getDisplayName";

const ChatApp = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !img.file) return;

    let imgUrl = null;
    try {
      if (img.file) {
        //imgUrl = await upload(img.file);

        console.log(img);
      }

      if (chatId) {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser?.userId,
            text,
            createdAt: new Date(),
            photoURL: currentUser?.photoUrl || "/images/deafult_avatar.jpg",
            ...(imgUrl && { img: imgUrl }),
          }),
        });
      }

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
      console.error(err);
    } finally {
      setText("");
      setImg({ file: null, url: "" });
    }
  };

  const handleMakeCall = (callType) => {
    if (callType === "voice") {
      alert(`📞 ${currentUser?.fullName} is calling you...`);
    } else if (callType === "video") {
      alert(`🎥 ${currentUser?.fullName} is starting a video call with you...`);
    } else {
      alert(`${currentUser?.fullName} is trying to reach you...`);
    }
  };

  return (
    <div className="flex-2 flex flex-col border-x border-gray-700 h-full">
      {/* Top */}
      <div className="flex justify-between items-center p-5 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoUrl || "/images/deafult_avatar.jpg"}
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-lg text-white">
              {getDisplayName(user)}
            </span>
            <p className="text-xs text-gray-400 italic tracking-wide">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400 text-xl">
          <IoCall
            className="cursor-pointer hover:text-white"
            onClick={() => handleMakeCall("voice")}
          />
          <IoVideocam
            className="cursor-pointer hover:text-white"
            onClick={() => handleMakeCall("video")}
          />
          <IoInformationCircle className="cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Center Messages */}
      <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
        {chat.messages.map((message, idx) => (
          <ChatMessage key={idx} message={message} currentUser={currentUser} />
        ))}
        {img.url && (
          <div className="self-end max-w-[70%]">
            <img
              src={img.url}
              alt="preview"
              className="w-full max-h-72 rounded-lg object-cover"
            />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Bottom Input */}
      <div className="flex items-center gap-4 p-5 border-t border-gray-700">
        <div className="flex gap-3 text-gray-400 text-xl">
          <label htmlFor="file" className="cursor-pointer">
            <IoImage className="hover:text-white" />
          </label>
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={handleImg}
          />
          <HiOutlineCamera className="cursor-pointer hover:text-white" />
          <IoMic className="cursor-pointer hover:text-white" />
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
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white outline-none placeholder-gray-400 disabled:cursor-not-allowed"
        />
        <div className="relative text-xl text-gray-400">
          <HiOutlineEmojiHappy
            className="cursor-pointer hover:text-white"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="absolute bottom-10 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-white ${
            isCurrentUserBlocked || isReceiverBlocked
              ? "bg-blue-600/60 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          <IoSend />
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
