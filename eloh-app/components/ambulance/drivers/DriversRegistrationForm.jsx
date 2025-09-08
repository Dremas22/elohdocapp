"use client";

import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { driverCategories, phoneCodes } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getFCMToken } from "@/lib/getFCMToken";

const DriversRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();

  // Form state initialization
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || "",
    idNumber: "",
    criminalRecord: { hasRecord: false, reason: "" },
    phoneCode: "+27",
    phoneNumber: "",
    category: "",
    role: "driver",
    email: "",
    certificate: null,
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Update form with current user info when available
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser?.email || "",
        photoUrl: currentUser?.photoUrl || "",
        fullName: currentUser?.displayName || "",
      }));
    }
  }, [currentUser]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value, checked, files } = e.target;

    // Criminal record checkbox toggling
    if (name === "hasRecord") {
      setFormData((prev) => ({
        ...prev,
        criminalRecord: {
          ...prev.criminalRecord,
          hasRecord: checked,
          reason: checked ? prev.criminalRecord.reason : "",
        },
      }));
      return;
    }

    // Criminal record reason input
    if (name === "criminalReason") {
      setFormData((prev) => ({
        ...prev,
        criminalRecord: { ...prev.criminalRecord, reason: value },
      }));
      return;
    }

    // Handle certificate file upload
    if (name === "certificate") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        certificate: file || null,
      }));
      setErrors((prev) => ({
        ...prev,
        certificate: null,
      }));
      return;
    }

    // Handle ID number input separately for validation clearing
    if (name === "idNumber") {
      setFormData((prev) => ({
        ...prev,
        idNumber: value,
      }));
      setErrors((prev) => ({
        ...prev,
        idNumber: "",
      }));
      return;
    }

    // Handle all other inputs generically
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate form data before submission
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (formData.criminalRecord.hasRecord) {
      if (!formData.criminalRecord.reason.trim()) {
        newErrors.criminalRecord = "Reason for criminal record is required.";
      }
    }

    if (!formData.certificate) {
      newErrors.certificate = "Certificate is required.";
    } else if (formData.certificate.type !== "application/pdf") {
      newErrors.certificate = "Only PDF files are allowed.";
    }

    if (!formData.idNumber?.trim()) {
      newErrors.idNumber = "ID Number is required.";
    } else if (!/^\d{13}$/.test(formData.idNumber.trim())) {
      newErrors.idNumber = "ID Number must be exactly 13 digits.";
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

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    // Stop submission if validation errors exist
    if (Object.keys(validationErrors).length !== 0) return;

    setSubmitting(true);
    const fcmToken = await getFCMToken();

    try {
      // Prepare form data for API
      const { phoneCode, certificate, ...cleanFormData } = formData;
      const combinedPhoneNumber = `${phoneCode}${formData.phoneNumber}`;

      // TODO: Save certificate file to Firebase Storage

      const payload = {
        ...cleanFormData,
        phoneNumber: combinedPhoneNumber,
        userId: currentUser?.uid,
        fullName: currentUser?.displayName || formData.fullName,
        photoUrl: currentUser?.photoURL,
        email: currentUser?.email,
        role: "driver",
        fcmToken: fcmToken || null,
      };

      // Call backend API to register user
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
        router.push("/dashboard/driver");
      } else if (response.status === 201) {
        toast.success("Driver successfully registered");
        await currentUser?.getIdToken(true);
        // Reset form after successful registration
        setFormData({
          fullName: "",
          idNumber: "",
          criminalRecord: { hasRecord: false, reason: "" },
          phoneCode: "+27",
          phoneNumber: "",
          category: "",
          role: "driver",
          email: currentUser?.email || "",
          certificate: null,
        });
        router.push("/dashboard/driver");
      } else {
        console.error(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while user data loads
  if (loading)
    return (
      <p className="text-black text-center py-10 font-medium">Loading...</p>
    );

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-10 bg-white rounded-3xl shadow-xl border border-blue-100">
      <h2 className="text-3xl font-bold mb-2 text-center text-blue-700">
        Ambulance Driver Registration 🚑
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Please complete the form below to register as an ambulance driver.
      </p>

      <form
        className="space-y-6"
        autoComplete="off"
        spellCheck="false"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="col-span-full">
            <input
              type="text"
              name="fullName"
              onChange={handleChange}
              value={formData.fullName}
              disabled={!!currentUser?.displayName}
              placeholder="Full Name"
              title="Enter your full name as shown on your official documents"
              className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? "border-red-500" : "border-gray-300"
                } ${currentUser?.displayName
                  ? "bg-gray-100 text-gray-600"
                  : "bg-white text-gray-900"
                } focus:outline-none`}
              style={{ cursor: currentUser?.displayName ? "not-allowed" : "text" }}
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
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
              title="Your email (auto-filled from login)"
              style={{ cursor: "not-allowed" }}
            />
          </div>

          {/* ID Number */}
          <div>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="ID Number"
              title="Enter your 13-digit government-issued ID number"
              className={`w-full px-4 py-3 rounded-lg border ${errors.idNumber ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900`}
              style={{ cursor: "text" }}
            />
            {errors.idNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              title="Select your driver category"
              className={`w-full px-4 py-3 rounded-lg border ${errors.category ? "border-red-500" : "border-gray-300"
                } bg-white text-gray-900 cursor-pointer`}
              style={{ cursor: "pointer" }}
            >
              <option value="" disabled>
                Select Category
              </option>
              {driverCategories.map(({ id, title }) => (
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
                title="Select your phone country code"
                className="w-full sm:w-28 px-3 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 cursor-pointer"
                style={{ cursor: "pointer" }}
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
                title="Enter your 9-digit phone number excluding country code"
                className={`w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } bg-white text-gray-900`}
                pattern="^[0-9]{9}$"
                style={{ cursor: "text" }}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Criminal Record */}
          <div className="col-span-full space-y-3">
            <div className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hasRecord"
                checked={formData.criminalRecord.hasRecord}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
                id="criminalRecordCheckbox"
                title="Tick if you have a criminal record"
              />
              <label
                htmlFor="criminalRecordCheckbox"
                className="text-gray-700 cursor-pointer"
              >
                I have a criminal record
              </label>
            </div>

            {formData.criminalRecord.hasRecord && (
              <div>
                <input
                  type="text"
                  name="criminalReason"
                  value={formData.criminalRecord.reason}
                  onChange={handleChange}
                  placeholder="Reason for criminal record"
                  title="Please provide the reason for your criminal record"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.criminalRecord ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900`}
                  style={{ cursor: "text" }}
                />
                {errors.criminalRecord && (
                  <p className="mt-1 text-sm text-red-600">{errors.criminalRecord}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Upload */}
        <div>
          <label
            htmlFor="certificate"
            className="block text-sm font-medium text-gray-900 mb-2 cursor-pointer"
            title="Upload your certificate as a PDF file"
          >
            Upload Certificate (PDF)
          </label>
          <input
            id="certificate"
            name="certificate"
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFormData({
                ...formData,
                certificate: e.target.files[0],
              })
            }
            className={`w-full px-4 py-3 rounded-lg border ${errors.certificate ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900 cursor-pointer`}
            title="Choose PDF file to upload"
          />
          {errors.certificate && (
            <p className="text-sm text-red-600 mt-1">{errors.certificate}</p>
          )}
        </div>
        {/* Submit and Cancel Buttons */}
        <div className="flex flex-col sm:flex-row justify-center mt-6 gap-3 sm:gap-4">
          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || submitting}
            title="Click to register as an ambulance driver"
            className="bg-[#03045e] hover:bg-[#0077b6] text-white flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3 sm:px-6 text-sm sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-[0_6px_#999] active:shadow-[0_4px_#666] active:translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 w-full sm:w-auto"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>

          {/* Cancel Registration Button */}
          <button
            type="button"
            onClick={() => router.push("/ambulance")}
            className="bg-red-700 hover:bg-red-400 text-gray-100 flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3 sm:px-6 text-sm sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
            title="Cancel registration and discard changes"
            disabled={submitting}
          >
            Cancel Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriversRegistrationForm;
