import { getMessageDate } from "@/lib/getMessageDate";
import { format } from "timeago.js";

const ChatMessage = ({ message, currentUser }) => {
  // Determine if the current user is the sender
  const isSender = message.senderId === currentUser?.userId;

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${isSender ? "justify-end" : "justify-start"
        }`}
    >
      {/* Receiver Avatar (only if not sender) */}
      {!isSender && (
        <img
          src={message?.photoUrl || "/images/default_avatar.jpg"}
          alt="Sender Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      <div
        className={`flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"
          }`}
      >
        {/* Message bubble */}
        {message.img && (
          <img
            src={message.img}
            alt="sent"
            className={`w-full max-h-72 rounded-2xl object-cover shadow-md ${isSender ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
          />
        )}

        {/* Text message */}
        {message.text && (
          <p
            className={`px-4 py-2 rounded-2xl text-sm shadow-md break-words ${isSender
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
              : "bg-gray-200 text-gray-900 rounded-bl-sm"
              }`}
          >
            {message.text}
          </p>
        )}

        {/* Timestamp */}
        <span className="text-[11px] text-gray-400 mt-1">
          {format(getMessageDate(message.createdAt))}{" "}
          {isSender && (
            <span className="font-medium text-blue-500">(You)</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
