"use client";

import { phoneCodes } from "@/constants";
import { useState } from "react";

const ProfileModal = ({ userDoc, onClose, onSave, loading }) => {
  const isPatient = userDoc?.role === "patient";

  const initialCode =
    phoneCodes.find((p) => userDoc?.phoneNumber?.startsWith(p.code))?.code ||
    "+27";

  const [phoneCode, setPhoneCode] = useState(initialCode);
  const [localNumber, setLocalNumber] = useState(
    userDoc?.phoneNumber?.replace(phoneCode, "") || ""
  );
  const [location, setLocation] = useState({
    country: userDoc?.location?.country || "",
    city: userDoc?.location?.city || "",
    addressLine: userDoc?.location?.addressLine || "",
  });

  const handleLocationChange = (field, value) => {
    setLocation((prev) => ({ ...prev, [field]: value }));
  };

  const handleDbSave = async () => {
    const errors = [];

    // Phone number validation
    if (!phoneCode) {
      errors.push("Phone code is required.");
    }

    if (!localNumber || localNumber.length !== 9) {
      errors.push("Phone number must be exactly 9 digits.");
    } else if (localNumber.startsWith("0")) {
      errors.push("Phone number should not start with 0.");
    }

    // Location validation (if patient)
    if (isPatient) {
      if (!location.country.trim()) errors.push("Country is required.");
      if (!location.city.trim()) errors.push("City is required.");
      if (!location.addressLine.trim())
        errors.push("Address line is required.");
    }

    if (errors.length > 0) {
      alert("Please fix the following:\n\n" + errors.join("\n"));
      return;
    }

    // Construct full phone number and data
    const updatedData = {
      phoneNumber: `${phoneCode}${localNumber}`,
      ...(isPatient && { location }),
    };

    await onSave(updatedData); // send back to SidebarMenu
    onClose(); // close modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4 text-[#123158]">
          Edit Profile
        </h2>

        <div className="space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <select
                value={phoneCode}
                onChange={(e) => {
                  setPhoneCode(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#123158]"
              >
                {phoneCodes.map(({ code, label }) => (
                  <option key={label} value={code}>
                    {code}
                  </option>
                ))}
              </select>

              {/* 9-digit input */}
              <input
                type="tel"
                value={localNumber}
                maxLength={9}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[1-9][0-9]{0,8}$/.test(val) || val === "") {
                    setLocalNumber(val);
                  }
                }}
                placeholder="e.g. 712345678"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#123158] bg-white text-black placeholder-gray-400"
              />
            </div>
          </div>

          {/* Location (if patient) */}
          {isPatient && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  value={location.country}
                  onChange={(e) =>
                    handleLocationChange("country", e.target.value)
                  }
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#123158]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#123158]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address Line
                </label>
                <input
                  type="text"
                  value={location.addressLine}
                  onChange={(e) =>
                    handleLocationChange("addressLine", e.target.value)
                  }
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#123158]"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-black hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleDbSave}
            className="px-4 py-2 bg-[#123158] text-white rounded-md hover:bg-[#0d2b4d]"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
