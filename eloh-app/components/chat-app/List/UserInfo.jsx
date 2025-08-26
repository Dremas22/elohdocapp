import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { getDisplayName } from "@/lib/getDisplayName";
import { FiMoreVertical } from "react-icons/fi";
import PatientProfileModal from "@/components/patients/PatientProfileModal";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const fullName = getDisplayName(currentUser);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleSave = (updatedData) => {
    console.log("Save profile data:", updatedData);
    setIsEditModalOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      {/* Icons */}
      <div className="pr-13 flex lg:gap-5 gap-4 text-gray-600">
        {/* More Options */}
        <div className="relative" ref={dropdownRef}>
          <FiMoreVertical
            className="w-5 h-5 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          />
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-white rounded-lg shadow-lg z-50">
              <ul className="flex flex-col">
                <li
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  View Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  Settings
                </li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
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
