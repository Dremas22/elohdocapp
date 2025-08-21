"use client";

import { FiX } from "react-icons/fi";
import { useUserStore } from "@/hooks/useUserStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useChatStore } from "@/hooks/useChatStore";
import Detail from "./Detail";
import List from "./List/List";
import ChatApp from "./ChatApp";

const ElohDocChatApp = ({ setOpenChat, role }) => {
  const { currentUser, isLoading } = useUserStore();
  const { chatId } = useChatStore();

  const router = useRouter();

  // Redirect if user is not logged in
  if (!isLoading && !currentUser) {
    router.push(`/sign-in?role=${role}`);
    return null;
  }

  // Show loading UI while fetching user
  if (isLoading || !currentUser) {
    return (
      <div className="w-[80vw] h-[90vh] flex items-center justify-center bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 p-6">
        <Loading message=" Loading chat... Please wait." />
      </div>
    );
  }

  return (
    <div className="w-[80vw] h-[90vh] max-h-[90vh] bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 flex mt-12 overflow-y-auto p-6 relative">
      {/* Close button */}
      <button
        onClick={() => setOpenChat(false)}
        className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full z-50"
        aria-label="Close chat"
      >
        <FiX size={24} className="text-red-500" />
      </button>

      <>
        <List />
        {chatId && <ChatApp role={role} />}
        {chatId && <Detail role={role} />}
      </>
    </div>
  );
};

export default ElohDocChatApp;
