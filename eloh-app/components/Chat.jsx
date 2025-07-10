"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { saveDiagnosis } from "@/lib/saveDiagnoses";
import useCurrentUser from "@/hooks/useCurrentUser";

const Chat = () => {
  const { currentUser, loading } = useCurrentUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

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

        // ✅ Save diagnosis if the response recommends consultation
        if (aiResponse.includes("Consult Now") && currentUser?.uid) {
          await saveDiagnosis({
            userId: currentUser?.uid,
            symptoms: newMessages
              .filter((m) => m.role === "user")
              .map((m) => m.content)
              .join("; "),
            diagnosis: aiResponse,
          });
        }
      }
    } catch (err) {
      console.error("❌ Failed to get response:", err);
      setMessages([
        ...messages,
        { role: "assistant", content: "❌ Failed to get response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-xl md:text-2xl font-semibold mb-6 text-center text-white">
        Hi, I’m <span className="font-bold">Elohdoc</span>, your health
        assistant.
        <br className="hidden md:block" />
        Kindly tell me about your health problems.
      </h1>

      <div
        ref={chatContainerRef}
        className="bg-white border rounded-lg p-4 h-[400px] md:h-[500px] overflow-y-auto shadow-inner space-y-4"
      >
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <Image
                src="/images/elohdoc.png"
                alt="AI Avatar"
                width={36}
                height={36}
                className="rounded-full w-9 h-9"
                priority
              />
            )}

            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm shadow-md ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
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
                  className="rounded-full object-cover h-9 w-9"
                  priority
                />
              ) : (
                <p className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 text-sm font-semibold">
                  {currentUser?.displayName?.charAt(0) || "U"}
                </p>
              ))}
          </div>
        ))}

        {/* Loader animation when AI is thinking */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
            <Image
              src="/images/elohdoc.png"
              alt="AI Avatar"
              width={30}
              height={30}
              className="rounded-full w-9 h-9"
              priority
            />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Chat input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center w-full">
        <input
          type="text"
          name="input"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          disabled={isLoading}
          placeholder="Type your symptoms..."
          className="flex-1 bg-gray-100 text-black border border-gray-300 rounded-l-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-5 py-2 text-sm rounded-r-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
