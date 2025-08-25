"use client";

import { FiX, FiArrowLeft } from "react-icons/fi";
import { useUserStore } from "@/hooks/useUserStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useChatStore } from "@/hooks/useChatStore";
import Detail from "./Detail";
import List from "./List/List";
import ChatApp from "./ChatApp";
import { useState, useEffect } from "react";

const ElohDocChatApp = ({ setOpenChat, role }) => {
  const { currentUser, isLoading } = useUserStore();
  const { chatId, setChatId } = useChatStore();
  const router = useRouter();
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile/tablet view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isLoading && !currentUser) {
    router.push(`/sign-in?role=${role}`);
    return null;
  }

  if (isLoading || !currentUser) {
    return (
      <div className="w-[80vw] h-[90vh] flex items-center justify-center bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 p-6">
        <Loading message="Loading chat... Please wait." />
      </div>
    );
  }

  return (
    <div className="w-[80vw] h-[90vh] max-h-[90vh] bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 flex pt-7 overflow-hidden relative">

      {/* Close chat button only on desktop */}
      {!isMobileView && (
        <button
          onClick={() => setOpenChat(false)}
          className="absolute top-10 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full z-50"
          aria-label="Close chat"
        >
          <FiX size={24} className="text-red-500" />
        </button>
      )}

      {/* Desktop (unchanged) */}
      {!isMobileView ? (
        <>
          <List />
          {chatId && <ChatApp role={role} />}
          {chatId && <Detail role={role} />}
        </>
      ) : (
        // Mobile/Tablet flow
        <>
          {!chatId ? (
            // Show only list
            <List />
          ) : (
            // Show chat full screen with back button
            <div className="flex flex-col w-full h-full relative">
              <ChatApp role={role} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ElohDocChatApp;
