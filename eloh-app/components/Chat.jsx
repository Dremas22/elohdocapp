"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/db/client";

const Chat = ({ setShowChat }) => {
  const { currentUser, loading } = useCurrentUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const checkConsultations = async () => {
      try {
        if (!loading && currentUser) {
          setIsLoading(true);
          const userRef = doc(db, "patients", currentUser.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();

          const consultations = userData?.numberOfConsultations || 0;
          console.log(consultations, "CONSULT", userData);
          if (consultations >= 1) {
            toast.info(
              "You already have consultations available. Redirecting..."
            );
            setShowChat(false);
            router.push("/dashboard/patient");
          }
        }
      } catch (error) {
        console.error("Something went wrong while checking user data");
      } finally {
        setIsLoading(false);
      }
    };

    checkConsultations();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setIsLoading(true);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userId: currentUser?.uid,
        }),
      });

      const data = await res.json();
      const aiResponse = data?.content;

      if (aiResponse) {
        const updatedMessages = [
          ...newMessages,
          { role: "assistant", content: aiResponse },
        ];
        setMessages(updatedMessages);

        if (aiResponse.includes("Consult Now") && currentUser?.uid) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/save-ai-diagnosis`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                aiResponse: aiResponse,
              }),
            }
          );

          toast.success(
            "Diagnosis complete. Redirecting you to the payment page to book your consultation...",
            {
              duration: 3000,
            }
          );

          setShowChat(false);
          router.push("/payment");
        }
      }
    } catch (err) {
      console.error("❌ Failed to get response:", err);
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "Hmm, something went wrong. Can you try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-h-screen w-full bg-gradient-to-br from-[#cce7ff] via-[#99d6ff] to-[#66b3ff]">
      {/* Navbar */}
      <nav className="w-full h-16 bg-[#003b5c] text-white flex items-center justify-between px-6 shadow-md z-50">
        <div className="text-lg font-bold">Elohdoc Chat</div>
      </nav>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#f8fbff] scroll-smooth"
        >
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex items-end ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <Image
                  src="/images/elohdoc.png"
                  alt="AI Avatar"
                  width={36}
                  height={36}
                  className="rounded-full w-9 h-9 mr-2"
                  priority
                />
              )}

              <div
                className={`px-4 py-2 text-sm max-w-[80%] break-words whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-none shadow-xl"
                    : "bg-blue-100 text-[#003b5c] rounded-2xl rounded-bl-none shadow-xl"
                }`}
              >
                {m.content}
              </div>

              {m.role === "user" &&
                (currentUser?.photoURL ? (
                  <Image
                    src={currentUser.photoURL}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9 ml-2"
                    priority
                  />
                ) : (
                  <div className="w-9 h-9 ml-2 flex items-center justify-center rounded-full bg-gray-300 text-gray-800 font-bold text-sm">
                    {currentUser?.displayName?.charAt(0) || "U"}
                  </div>
                ))}
            </div>
          ))}

          {/* Typing animation */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm pl-2 animate-pulse">
              <Image
                src="/images/elohdoc.png"
                alt="AI Avatar"
                width={30}
                height={30}
                className="rounded-full w-8 h-8"
                priority
              />
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-blue-200 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="flex p-3 bg-white border-t border-blue-100"
        >
          <input
            type="text"
            name="input"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            disabled={isLoading || loading}
            placeholder="Type your message..."
            className="flex-1 bg-[#f0f8ff] text-black px-4 py-2 text-sm rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={isLoading || loading}
            className="bg-[#03045e] text-white py-2 px-4 text-sm sm:text-base font-semibold rounded-r-md shadow-md hover:bg-[#023e8a] transition-all duration-200"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
