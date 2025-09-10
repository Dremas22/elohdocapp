import { useState } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { getDisplayName } from "@/lib/getDisplayName";
import { FiX } from "react-icons/fi";
import PatientProfileModal from "@/components/patients/PatientProfileModal";
import { useChatStore } from "@/hooks/useChatStore";

const UserInfo = ({ setOpenChat }) => {
  const { currentUser } = useUserStore();
  const { chatId, setChatId } = useChatStore(); // Access chat store
  const fullName = getDisplayName(currentUser);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSave = (updatedData) => {
    console.log("Save profile data:", updatedData);
    setIsEditModalOpen(false);
  };

  const handleCloseChat = () => {
    setChatId(null);
    setOpenChat(false);
  };

  return (
    <div className="relative flex items-center justify-between lg:-mt-6 -mt-8 p-4">
      {/* User Info */}
      <div className="flex items-center lg:gap-5 gap-3">
        <img
          src={currentUser?.photoURL || "/images/default_avatar.jpg"}
          alt="User Avatar"
          className="lg:w-12 lg:h-12 w-10 h-10 rounded-full object-cover"
        />
        <h2 className="hidden sm:block text-lg font-semibold">{fullName}</h2>
      </div>

      {(currentUser?.role === "driver" || currentUser?.role === "customer") && (
        <div className="flex lg:gap-5 gap-4 red-text">
          {/* Close Button */}
          <button
            onClick={handleCloseChat}
            className="p-2 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"
            title="Close chat"
          >
            <FiX className="w-5 h-5 text-red-500 hover:text-red-700 transition-colors" />
          </button>
        </div>
      )}

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
