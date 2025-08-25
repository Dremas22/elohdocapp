import { useUserStore } from "@/hooks/useUserStore";
import { getDisplayName } from "@/lib/getDisplayName";
import { FiMoreVertical, FiVideo, FiEdit } from "react-icons/fi";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  const fullName = getDisplayName(currentUser);
  return (
    <div className="flex items-center justify-between p-5">
      {/* User Info */}
      <div className="flex items-center gap-5">
        <img
          src={currentUser?.photoUrl || "/images/default_avatar.jpg"}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold">{fullName}</h2>
      </div>

      {/* Icons */}
      <div className="flex gap-5 text-gray-600">
        <FiMoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-700 transition-colors" />
        <FiVideo className="w-5 h-5 cursor-pointer hover:text-gray-700 transition-colors" />
        <FiEdit className="w-5 h-5 cursor-pointer hover:text-gray-700 transition-colors" />
      </div>
    </div>
  );
};

export default UserInfo;
