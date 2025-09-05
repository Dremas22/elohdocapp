"use client";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import Navbar from "@/components/MainNavbar";
import { toastError, toastSuccess } from "@/helpers/toastHelper";
const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const form = useRef();

  const handleSendForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!form.current) {
      toastError("Form reference is missing. Please refresh and try again.");
      setSubmitting(false);
      return;
    }

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID,
        form.current,
        process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
      );

      toastSuccess(
        "✅ Your message has been sent successfully. We'll get back to you shortly!"
      );
      form.current.reset(); // optional: clear form after success
    } catch (error) {
      console.error("EmailJS Error:", error);
      toastError(
        "❌ Oops! Something went wrong while sending your message. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 sm:px-6 py-12 bg-white text-gray-800">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#03045e] mb-3 sm:mb-4 text-center">
          Contact Us
        </h1>
        <p className="text-center max-w-2xl text-sm sm:text-base mb-8 sm:mb-10 text-gray-600 leading-relaxed px-2">
          If you have suggestions or need assistance, please reach out using the
          details below or drop us a message.
        </p>

        <form
          ref={form}
          onSubmit={handleSendForm}
          className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-8"
        >
          <div className="space-y-6">
            {/* Subject */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e] transition duration-150"
                required
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e] transition duration-150"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e] transition duration-150"
                required
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Message
              </label>
              <textarea
                rows="5"
                name="message"
                placeholder="Your message..."
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03045e] transition duration-150 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                className="bg-[#03045e] text-white py-3 px-8 text-sm sm:text-lg font-semibold rounded-xl shadow-md hover:shadow-lg active:shadow-inner active:translate-y-[1px] hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Contact;
