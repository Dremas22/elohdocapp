"use client";

import { useState, useRef } from "react";
import { phoneCodes, africanCountries, banks } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deleteUser } from "firebase/auth";
import { auth, db } from "@/db/client";
import {
  doc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";

const ProfileModal = ({ userDoc, onClose, onSave, loading }) => {
  const isPatient = userDoc?.role === "patient";
  const { handleSignOut } = useCurrentUser();

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
  const [bankingDetails, setBankingDetails] = useState({
    accountName: userDoc?.banking?.accountName || "",
    accountNumber: userDoc?.banking?.accountNumber || "",
    bank: userDoc?.banking?.bank || "",
  });

  const [logo, setLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
    const errors = {};

    if (userDoc?.role === "doctor") {
      if (!bankingDetails.accountName.trim()) {
        errors.accountName = "Account holder name is required.";
      }

      if (!bankingDetails.bank) {
        errors.bank = "Please select a bank.";
      }

      if (!bankingDetails.accountNumber.trim()) {
        errors.accountNumber = "Account number is required.";
      } else if (!/^\d{6,20}$/.test(bankingDetails.accountNumber.trim())) {
        errors.accountNumber =
          "Account number must be digits only and at least 6 characters.";
      }
    }

    if (!localNumber) {
      errors.localNumber = "Phone number is required.";
    }

    if (isPatient) {
      if (!location.country) {
        errors.country = "Please select a country.";
      }
      if (!location.city.trim()) {
        errors.city = "City is required.";
      }
      if (!location.addressLine.trim()) {
        errors.addressLine = "Address is required.";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedData = {
      phoneNumber: `${phoneCode}${localNumber}`,
      ...(isPatient && { location }),
      ...(userDoc?.role === "doctor" && {
        banking: {
          ...bankingDetails,
        },
      }),
    };

    // TODO: Make sure you also save logo to firebase storage
    console.log(logo, "LOGO_IMAGE");

    await onSave(updatedData);
    router.refresh();
    onClose();
  };

  const handleDeleteAccount = async () => {
    const user = auth?.currentUser;
    try {
      const confirmDeleteAccount = confirm(
        "Are you sure you want to delete your account?"
      );

      if (!confirmDeleteAccount || !user) return;
      const uid = user.uid;

      // Step 1: Try deleting from doctors, nurses, patients collections
      const collections = ["doctors", "nurses", "patients"];

      let found = false;
      for (const col of collections) {
        const docRef = doc(db, col, uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await deleteDoc(docRef);
          found = true;
          break;
        }
      }

      // Step 2: Delete diagnoses linked to user (userId === uid)
      const diagnosesQuery = query(
        collection(db, "diagnosis"),
        where("userId", "==", uid)
      );
      const diagnosesSnap = await getDocs(diagnosesQuery);
      const deletePromises = diagnosesSnap.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Step 3: Delete the Firebase Auth user
      await deleteUser(user);

      // Step 4: Sign out and notify
      await handleSignOut();
      router.refresh();
      toast.success("Your account and all associated data have been deleted.");
    } catch (error) {
      console.error("Account deletion error:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log in again to delete your account for security.");
      } else {
        toast.error("Something went wrong while deleting your account.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px] z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl text-black p-6 w-full max-w-md shadow-lg relative border-t-8 border-[#0d6efd]">
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
            {fieldErrors.localNumber && (
              <p className="text-sm text-red-500 mt-1">
                {fieldErrors.localNumber}
              </p>
            )}
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
                {fieldErrors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldErrors.country}
                  </p>
                )}
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
                {fieldErrors.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldErrors.city}
                  </p>
                )}
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
                {fieldErrors.addressLine && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldErrors.addressLine}
                  </p>
                )}
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

              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Banking Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankingDetails.accountName}
                    onChange={(e) =>
                      setBankingDetails((prev) => ({
                        ...prev,
                        accountName: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                  />
                  {fieldErrors.accountName && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.accountName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <select
                    value={bankingDetails.bank}
                    onChange={(e) =>
                      setBankingDetails((prev) => ({
                        ...prev,
                        bank: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                  >
                    <option value="">Select Bank</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.title}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.bank && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.bank}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankingDetails.accountNumber}
                    maxLength={20}
                    onChange={(e) =>
                      setBankingDetails((prev) => ({
                        ...prev,
                        accountNumber: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                  />
                  {fieldErrors.accountNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.accountNumber}
                    </p>
                  )}
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
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="bg-[#5e0303] text-white py-3 px-5 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#8a0202] transition-all duration-200 ease-in-out cursor-pointer"
            aria-label="Delete_Account"
            title="Delete Account"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
