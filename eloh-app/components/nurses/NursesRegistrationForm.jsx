"use client";

import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { nurseCategories, phoneCodes } from "@/constants";
import { useRouter } from "next/navigation";

const NursesRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    practiceNumber: "",
    phoneCode: "+27",
    phoneNumber: "",
    category: "",
    role: "nurse",
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
        fullName: currentUser?.displayName,
        photoUrl: currentUser?.photoURL,
        email: currentUser?.email,
        role: "nurse",
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
        alert("User already exists");
        router.push("/dashboard/nurse");
      } else if (response.status === 201) {
        alert("User successfully registered");
        setFormData({
          practiceNumber: "",
          phoneCode: "+27",
          phoneNumber: "",
          category: "",
          role: "nurse",
          email: currentUser?.email,
        });
        router.push("/dashboard/nurse");
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
      <p className="text-black text-center py-10 font-medium">Loading...</p>
    );

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-10 bg-white rounded-3xl shadow-xl border border-blue-100">
      <h2 className="text-3xl font-bold mb-2 text-center text-blue-700">
        Nurse Registration
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Please complete the form below to register as a nurse.
      </p>

      <form
        className="space-y-6"
        autoComplete="off"
        spellCheck="false"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="col-span-full">
            <input
              type="text"
              name="fullName"
              value={currentUser?.displayName || ""}
              placeholder="Full Name"
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="col-span-full">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
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
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.practiceNumber ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150`}
            />
            {errors.practiceNumber && (
              <p className="mt-1 text-sm text-red-600">
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
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150`}
            >
              <option value="" disabled>
                Select Category
              </option>
              {nurseCategories.map(({ id, title }) => (
                <option key={id} value={title}>
                  {title}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Phone Code + Number */}
          <div className="col-span-full">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className="w-full sm:w-28 px-3 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150"
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150`}
                pattern="^[0-9]{9}$"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading || submitting}
            className="bg-[#03045e] hover:bg-[#0077b6] text-white flex items-center gap-3 py-3 px-6 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NursesRegistrationForm;
