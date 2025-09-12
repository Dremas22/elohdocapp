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
      <body className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-6 rounded-2xl shadow-lg bg-white">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">
            Oops! Something went wrong 😥
          </h2>
          <p className="text-gray-700 mb-5">
            We’re having trouble loading this page right now. Please try again
            or sign back in.
          </p>
          <button
            onClick={() => handleAuthAction()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
