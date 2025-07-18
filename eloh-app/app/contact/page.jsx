"use client";

import Navbar from "@/components/Navbar";
const Contact = () => {
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center w-full min-h-screen px-6 py-12 bg-white text-gray-800">
        <h1 className="text-4xl font-bold text-[#03045e] mb-4">Contact Us</h1>
        <p className="text-center max-w-xl text-sm sm:text-base mb-10 text-gray-600">
          Have questions, suggestions, or need assistance? We'd love to hear from you.
          Please reach out using the details below or drop us a message.
        </p>

        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Message</label>
            <textarea
              rows="4"
              placeholder="Your message..."
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e]"
            />
          </div>

          {/* Centered Button */}
          <div className="flex justify-center">
            <button
              className="bg-[#03045e] text-white py-3 px-6 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
              type="submit"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
