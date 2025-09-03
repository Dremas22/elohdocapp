import { useState } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { getDisplayName } from "@/lib/getDisplayName";
import { FiX } from "react-icons/fi";
import PatientProfileModal from "@/components/patients/PatientProfileModal";
import { useChatStore } from "@/hooks/useChatStore";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const { chatId, setChatId } = useChatStore(); // Access chat store
  const fullName = getDisplayName(currentUser);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSave = (updatedData) => {
    console.log("Save profile data:", updatedData);
    setIsEditModalOpen(false);
  };

  const handleCloseChat = () => {
    setChatId(null); // Close the current chat
  };

  return (
    <div className="relative flex items-center justify-between -mt-6 p-5">
      {/* User Info */}
      <div className="flex items-center gap-5">
        <img
          src={currentUser?.photoUrl || "/images/default_avatar.jpg"}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2 className="hidden sm:block text-lg font-semibold">{fullName}</h2>
      </div>

      <div className=" flex lg:gap-5 gap-4 red-text">

        {/* Close Button */}
        <button
          onClick={handleCloseChat}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"
          title="Close chat"
        >
          <FiX
            className="w-5 h-5 text-red-500 hover:text-red-700 transition-colors"
          />
        </button>

      </div>

      {/* Render Patient Profile Modal */}
      <PatientProfileModal
        userDoc={currentUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default UserInfo;