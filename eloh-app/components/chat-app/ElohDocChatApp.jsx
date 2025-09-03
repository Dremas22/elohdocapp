"use client";

import { useUserStore } from "@/hooks/useUserStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useChatStore } from "@/hooks/useChatStore";
import Detail from "./Detail";
import List from "./List/List";
import ChatApp from "./ChatApp";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

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
      <div className="w-full max-w-5xl h-auto min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 p-4 sm:p-6">
        <div className=" bg-flex justify-start lg:mr-50 w-full h-full">
          <Loading message="Loading chat... Please wait." />
        </div>
      </div>
    );
  }

  // Show close button only for customers and drivers
  const showCloseButton = currentUser?.role === "customer" || currentUser?.role === "driver";

  return (
    <div className="w-full h-full max-h-full bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 flex pt-7 overflow-hidden relative">

      {/* Close Chat Button */}
      {showCloseButton && setOpenChat && (
        <button
          onClick={() => setOpenChat(false)}
          className="absolute top-3 right-3 z-50 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
          title="Close Chat"
        >
          <FiX className="h-6 w-6" />
        </button>
      )}

      {/* Desktop */}
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
            <List />
          ) : (
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
