"use client";

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
  const { chatId } = useChatStore();
  const router = useRouter();
  const [viewMode, setViewMode] = useState("desktop");

  // Detect view mode (mobile, tablet, desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("mobile");
      } else if (window.innerWidth < 1024) {
        setViewMode("tablet");
      } else {
        setViewMode("desktop");
      }
    };
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
        <div className="bg-flex justify-start lg:mr-50 w-full h-full">
          <Loading message="Loading chat... Please wait." />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-[160vh] md:w-[95vh] w-[47.5vh] h-full max-h-full justify-center bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 flex pt-7  overflow-visible relative">
      {/* Desktop Layout */}
      {viewMode === "desktop" && (
        <>
          <List setOpenChat={setOpenChat} />
          {chatId && <ChatApp role={role} />}
          {chatId && <Detail role={role} />}
        </>
      )}

      {/* Tablet Layout */}
      {viewMode === "tablet" && (
        <>
          <List setOpenChat={setOpenChat} />
          {chatId && <ChatApp role={role} />}
          {/* No Detail panel on tablet to avoid cramping */}
        </>
      )}

      {/* Mobile Layout */}
      {viewMode === "mobile" && (
        <>
          {!chatId ? (
            <List setOpenChat={setOpenChat} />
          ) : (
            <div className="flex flex-col w-full h-[60vh] relative">
              <ChatApp role={role} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ElohDocChatApp;
