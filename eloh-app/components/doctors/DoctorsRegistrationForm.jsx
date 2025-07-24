"use client";

import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { doctorCategories, phoneCodes } from "@/constants";
import { useRouter } from "next/navigation";

const DoctorsRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || "",
    practiceNumber: "",
    phoneCode: "+27",
    phoneNumber: "",
    category: "",
    role: "doctor",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser?.email || "",
        photoUrl: currentUser?.photoUrl || "",
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field on change
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.practiceNumber.trim()) {
      newErrors.practiceNumber = "Practice number is required.";
    } else if (!/^\d{7}$/.test(formData.practiceNumber.trim())) {
      newErrors.practiceNumber = "Practice number must be exactly 7 digits.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber =
        "Phone number must be exactly 9 digits (excluding country code).";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;
    setSubmitting(true);

    try {
      const { phoneCode, ...cleanFormData } = formData;
      const combinedPhoneNumber = `${phoneCode}${formData.phoneNumber}`;
      const payload = {
        ...cleanFormData,
        phoneNumber: combinedPhoneNumber,
        userId: currentUser?.uid,
        fullName: currentUser?.displayName || formData.fullName,
        photoUrl: currentUser?.photoURL,
        email: currentUser?.email,
        role: "doctor",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/register-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.message === "User already exists") {
        router.push("/dashboard/doctor");
      } else if (response.status === 201) {
        setFormData({
          practiceNumber: "",
          phoneCode: "+27",
          phoneNumber: "",
          category: "",
          role: "doctor",
          email: currentUser?.email,
        });
        router.push("/dashboard/doctor");
      } else {
        console.error(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="text-[#03045e] text-center py-10 font-medium">Loading...</p>
    );

  return (
    <div className="w-full px-4 py-6 sm:px-6 bg-white rounded-2xl shadow-lg border border-[#caf0f8]">
      <h2 className="text-2xl font-bold text-[#03045e] mb-6 text-center">
        Doctor Registration
      </h2>

      <form
        className="space-y-6"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck="false"
        noValidate
      >
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="col-span-full">
            <input
              type="text"
              name="fullName"
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              value={currentUser?.displayName || formData.fullName || ""}
              disabled={!!currentUser?.displayName}
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              } ${
                currentUser?.displayName
                  ? "bg-gray-100 text-gray-600"
                  : "bg-white text-gray-900"
              } focus:outline-none`}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-full">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-600 cursor-not-allowed"
              placeholder="Email"
            />
          </div>

          {/* Practice Number */}
          <div>
            <input
              type="text"
              name="practiceNumber"
              value={formData.practiceNumber}
              onChange={handleChange}
              placeholder="Practice Number"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.practiceNumber ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:ring-2 focus:ring-[#90e0ef]`}
            />
            {errors.practiceNumber && (
              <p className="text-sm text-red-600 mt-1">
                {errors.practiceNumber}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:ring-2 focus:ring-[#90e0ef]`}
            >
              <option value="" disabled>
                Select Category
              </option>
              {doctorCategories.map(({ id, title }) => (
                <option key={id} value={title}>
                  {title}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Phone Code + Number */}
          <div className="col-span-full">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className="w-full sm:w-24 px-3 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#90e0ef]"
              >
                {phoneCodes.map(({ code, label }) => (
                  <option key={label} value={code}>
                    {code}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:ring-2 focus:ring-[#90e0ef]`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading || submitting}
            className="bg-[#03045e] cursor-ptext-white py-3 px-5 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorsRegistrationForm;
