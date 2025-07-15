"use client";

import { useState } from "react";
import { phoneCodes, africanCountries } from "@/constants";

const ProfileModal = ({ userDoc, onClose, onSave, loading }) => {
  const isPatient = userDoc?.role === "patient";

  const initialCode =
    phoneCodes.find((p) => userDoc?.phoneNumber?.startsWith(p.code))?.code ||
    "+27";

  const [phoneCode, setPhoneCode] = useState(initialCode);
  const [localNumber, setLocalNumber] = useState(
    userDoc?.phoneNumber?.replace(initialCode, "") || ""
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

    if (!phoneCode) {
      errors.push("Phone code is required.");
    }

    if (!localNumber || localNumber.length !== 9) {
      errors.push("Phone number must be exactly 9 digits.");
    } else if (localNumber.startsWith("0")) {
      errors.push("Phone number should not start with 0.");
    }

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

    const updatedData = {
      phoneNumber: `${phoneCode}${localNumber}`,
      ...(isPatient && { location }),
    };

    await onSave(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl text-black p-6 w-full max-w-md shadow-lg relative border-t-8 border-[#0d6efd]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-5 text-[#0d6efd] text-center">
          Edit Profile
        </h2>

        <div className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
              >
                {phoneCodes.map(({ code, label }) => (
                  <option key={label} value={code}>
                    {code}
                  </option>
                ))}
              </select>

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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd] bg-white text-black placeholder-gray-400"
              />
            </div>
          </div>

          {/* Location for patients */}
          {isPatient && (
            <>
              {/* Country Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={location.country}
                  onChange={(e) =>
                    handleLocationChange("country", e.target.value)
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                >
                  <option value="">Select Country</option>
                  {africanCountries.map(({ id, title }) => (
                    <option key={id} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) =>
                    handleLocationChange("city", e.target.value)
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                />
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address Line
                </label>
                <input
                  type="text"
                  value={location.addressLine}
                  onChange={(e) =>
                    handleLocationChange("addressLine", e.target.value)
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDbSave}
            className="bg-[#03045e] text-white py-3 px-5 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;