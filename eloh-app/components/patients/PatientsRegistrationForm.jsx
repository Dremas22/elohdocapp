"use client";

import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { phoneCodes } from "@/constants";

const PatientsRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    idNumber: "",
    location: {
      country: "",
      city: "",
      addressLine: "",
    },
    phoneCode: "+27",
    phoneNumber: "",
    medicalHistory: [],
    role: "patient",
    email: "",
  });

  // Example structure:
  // {
  //   date: "2025-07-02",
  //   notes: "Initial consultation - no allergies reported",
  //   addedBy: "Dr. Nelson Malgas",
  // }

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || "",
        photoUrl: currentUser.photoUrl || "",
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

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));

    // Clear corresponding error
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Validate South African ID Number (13 digits)
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required.";
    } else if (!/^\d{13}$/.test(formData.idNumber.trim())) {
      newErrors.idNumber = "ID number must be exactly 13 digits.";
    }

    // Validate location fields
    if (!formData.location.country.trim()) {
      newErrors.country = "Country is required.";
    }
    if (!formData.location.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.location.addressLine.trim()) {
      newErrors.addressLine = "Address is required.";
    }

    // Phone number validation (excluding country code)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber =
        "Phone number must be exactly 9 digits (excluding country code).";
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
        role: "patient",
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
        router.push("/dashboard/patient");
      } else if (response.status === 201) {
        setFormData({
          idNumber: "",
          location: {
            country: "",
            city: "",
            addressLine: "",
          },
          phoneCode: "+27",
          phoneNumber: "",
          medicalHistory: [],
          role: "patient",
          email: "",
        });
        router.push("/dashboard/patient");
      } else {
        console.error(result.error || "Something went wrong");
      }

      console.log("Form Submitted Successfully", payload);
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
    <div className="w-full max-w-lg mx-auto px-6 py-8 bg-white rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
        Patients Registration Form
      </h2>

      <form
        className="space-y-6"
        autoComplete="off"
        spellCheck="false"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* ID Number */}
          <div className="sm:col-span-1">
            <input
              type="text"
              name="idNumber"
              id="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md border ${
                errors.idNumber ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="ID Number"
            />
            {errors.idNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
            )}
          </div>

          {/* Role */}
          <div className="sm:col-span-1">
            <input
              type="text"
              id="role"
              value={formData.role}
              readOnly
              className="w-full px-4 py-3 rounded-md border bg-gray-200 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Country */}
          <div className="sm:col-span-1">
            <input
              type="text"
              name="country"
              id="country"
              value={formData.location.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
              className={`w-full px-4 py-3 rounded-md border ${
                errors.country ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Country"
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          {/* City */}
          <div className="sm:col-span-1">
            <input
              type="text"
              id="city"
              name="city"
              value={formData.location.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
              className={`w-full px-4 py-3 rounded-md border ${
                errors.city ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          {/* Address */}
          <div className="col-span-full">
            <input
              type="text"
              name="addressLine"
              id="addressLine"
              value={formData.location.addressLine}
              onChange={(e) =>
                handleLocationChange("addressLine", e.target.value)
              }
              className={`w-full px-4 py-3 rounded-md border ${
                errors.addressLine ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Address"
            />
            {errors.addressLine && (
              <p className="mt-1 text-sm text-red-600">{errors.addressLine}</p>
            )}
          </div>

          {/* Phone Code & Number */}
          <div className="col-span-full">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className={`w-full sm:w-24 px-3 py-3 rounded-lg border ${
                  errors.phoneCode ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
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
                } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                pattern="^[0-9]{6,10}$"
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
            className="w-full max-w-xs py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold
        hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientsRegistrationForm;
