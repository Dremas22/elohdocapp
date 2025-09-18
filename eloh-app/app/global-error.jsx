"use client";

import "./globals.css";

export default function GlobalError({ error, reset }) {
  /**
   * Handles broken session deletion
   */
  const handleAuthAction = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });
      reset?.();
      window.location.href = "/";
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Error 🚨</title>
        <meta
          name="description"
          content="We’re having trouble loading this page right now. Please try again or sign back in."
        />
      </head>
      <body className="min-h-screen bg-gray-100 pt-20 flex items-center justify-center">
        <div className="text-center text-blue-600">
          <h2 className="text-lg font-medium">Oops! Something went wrong 😥</h2>
          <p className="text-sm mt-1">
            We’re having trouble loading this page right now. Please try again or sign back in.
          </p>
          <button
            onClick={handleAuthAction}
            className="bg-[#03045e] text-white font-semibold py-3 px-8 mt-5 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
