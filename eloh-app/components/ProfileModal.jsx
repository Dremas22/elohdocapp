"use client";

import { useState, useRef } from "react";
import { phoneCodes, africanCountries } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  const [logo, setLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const router = useRouter();
  const fileInputRef = useRef();

  const handleLocationChange = (field, value) => {
    setLocation((prev) => ({ ...prev, [field]: value }));
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLogo(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      resetFileInput();
      return;
    }

    const isValidType = ["image/png", "image/jpeg", "image/webp"].includes(
      file.type
    );
    const isValidSize = file.size <= 2 * 1024 * 1024;

    if (!isValidType) {
      toast.error("Only PNG, JPG, or WEBP images are allowed.");
      resetFileInput();
      return;
    }

    if (!isValidSize) {
      toast.error("File size must be under 2MB.");
      resetFileInput();
      return;
    }

    setImageError(null);
    setLogo(file);
    setPreviewUrl(URL.createObjectURL(file));
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

    // TODO: Make sure you also save logo to firebase storage
    console.log(logo, "LOGO_IMAGE");

    await onSave(updatedData);
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px] z-50 flex items-center justify-center">
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

          {/* Patient Location Fields */}
          {isPatient && (
            <>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                />
              </div>

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

        <div className="m-4">
          {/* Image Upload for doctors only */}
          {userDoc?.role === "doctor" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm flex items-center justify-center bg-gray-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400 select-none">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="profileImageInput"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12a4 4 0 01-8 0 4 4 0 018 0z"
                      ></path>
                    </svg>
                    Choose Image
                  </label>
                  <input
                    ref={fileInputRef}
                    id="profileImageInput"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-gray-500 select-none">
                    Supported formats: PNG, JPEG, WEBP (max 2MB)
                  </p>
                </div>
              </div>
            </div>
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
