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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, checked, files } = e.target;

    // Handle criminal record checkbox
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

    // Handle criminal record reason
    if (name === "criminalReason") {
      setFormData((prev) => ({
        ...prev,
        criminalRecord: { ...prev.criminalRecord, reason: value },
      }));
      return;
    }

    // Handle certificate file
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

    // Handle ID number
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

    // Handle all other inputs
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    setSubmitting(true);
    const fcmToken = await getFCMToken();

    try {
      const { phoneCode, certificate, ...cleanFormData } = formData;
      const combinedPhoneNumber = `${phoneCode}${formData.phoneNumber}`;

      // TODO: Make sure you save certificate the firebase storage
      console.log(certificate, "CERTIFICATE");

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
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
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
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.idNumber ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900`}
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
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } bg-white text-gray-900`}
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
                className="w-full sm:w-28 px-3 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
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
                } bg-white text-gray-900`}
                pattern="^[0-9]{9}$"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Criminal Record */}
          <div className="col-span-full space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="hasRecord"
                checked={formData.criminalRecord.hasRecord}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label className="text-gray-700">I have a criminal record</label>
            </div>

            {formData.criminalRecord.hasRecord && (
              <div>
                <input
                  type="text"
                  name="criminalReason"
                  value={formData.criminalRecord.reason}
                  onChange={handleChange}
                  placeholder="Reason for criminal record"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.criminalRecord ? "border-red-500" : "border-gray-300"
                  } bg-white text-gray-900`}
                />
                {errors.criminalRecord && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.criminalRecord}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Upload */}
        <div>
          <label
            htmlFor="certificate"
            className="block text-sm font-medium text-gray-900 mb-2"
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
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.certificate ? "border-red-500" : "border-gray-300"
            } bg-white text-gray-900`}
          />
          {errors.certificate && (
            <p className="text-sm text-red-600 mt-1">{errors.certificate}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading || submitting}
            className="bg-[#03045e] hover:bg-[#0077b6] text-white flex items-center gap-3 py-3 px-6 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 transition-all duration-200 ease-in-out"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriversRegistrationForm;
