"use client";

import { FiX } from "react-icons/fi";

const ElohDocChatApp = ({ setOpenChat }) => {
  return (
    <div className="w-[80vw] h-[90vh] max-h-[90vh] bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] saturate-180 rounded-xl border border-white/20 flex flex-col mt-12 overflow-y-auto p-6">
      {/* Close button */}
      <button
        onClick={() => setOpenChat(false)}
        className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full z-60"
      >
        <FiX size={24} className="text-red-500" />
      </button>
      <h1 className="text-2xl font-bold mb-4">ElohDoc Chat App</h1>
      <p className="text-center max-w-lg mx-auto leading-relaxed">
        This is where the{" "}
        <span className="font-semibold">ElohDoc Chat App</span> will be
        displayed. All <span className="italic">customers</span> (e-hailing
        customers) and <span className="italic">patients</span> will be able to
        chat directly with <span className="font-semibold">drivers</span> and
        healthcare staff (<span className="italic">doctors</span> &{" "}
        <span className="italic">nurses</span>).
      </p>
    </div>
  );
};

export default ElohDocChatApp;
