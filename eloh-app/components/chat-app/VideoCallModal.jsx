"use client";

import { MdOutlinePhoneCallback } from "react-icons/md";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";

/**
 * VideoCallModal displays the incoming video call UI.
 *
 * @param {Object} props
 * @param {Object} props.incomingCall - The incoming call object.
 * @param {Function} props.handleAcceptCall - Function to accept the call.
 * @param {Function} props.handleDeclineCall - Function to decline the call.
 * @returns {JSX.Element}
 */
const VideoCallModal = ({
  incomingCall,
  handleAcceptCall,
  handleDeclineCall,
}) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl flex flex-col items-center gap-4 w-80">
        <h2 className="text-white text-lg font-semibold">Incoming Call</h2>
        <p className="text-gray-300 text-center">
          {incomingCall.caller.name} is calling you
        </p>
        <div className="flex gap-4 mt-4">
          <button
            title="Click to accept the call"
            onClick={handleAcceptCall}
            className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            <MdOutlinePhoneCallback className="w-5 h-5 text-green-500" />
          </button>

          <button
            title="Click to decline the call"
            onClick={handleDeclineCall}
            className="bg-[#03045e] text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            <HiOutlinePhoneMissedCall className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
