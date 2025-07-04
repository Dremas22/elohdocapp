"use client";

import MeetingRoom from "@/components/video-conferencing/MeetingRoom";

const Room = () => {
  return (
    <div className="flex h-screen">
      {/* Video Meeting Section */}
      <div className="flex-1 relative">
        <MeetingRoom />
      </div>

      {/* Placeholder for Text Editor */}
      <aside className="w-full max-w-md bg-white border-l px-6 py-4 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Doctor's Notes</h2>
        <div className="w-full h-[calc(100vh-100px)] border rounded-md p-4 text-gray-500 bg-gray-50">
          <p className="text-center text-sm italic text-gray-400">
            Text editor goes here. Doctors can write consultation notes during
            the meeting.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Room;
