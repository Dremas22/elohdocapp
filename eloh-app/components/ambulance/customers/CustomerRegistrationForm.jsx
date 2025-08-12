import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { phoneCodes } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const CustomerRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCode: "+27",
    phoneNumber: "",
    photoUrl: "",
    role: "customer",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser?.email || "",
        photoUrl: currentUser?.photoURL || "",
        fullName: currentUser?.displayName || "",
      }));
    }
  }, [currentUser?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required. Please make sure you are logged in";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address.";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number should be exactly 9 digits.";
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
      const { phoneCode, certificate, ...cleanFormData } = formData;
      const combinedPhoneNumber = `${phoneCode}${formData.phoneNumber}`;

      const payload = {
        fullName: currentUser?.displayName || formData.fullName,
        email: currentUser?.email,
        photoUrl: currentUser?.photoURL || formData.photoUrl,
        role: "customer",
        phoneNumber: combinedPhoneNumber,
        userId: currentUser?.uid,
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
        router.push("/dashboard/customer");
      } else if (response.status === 201) {
        toast.success("Customer successfully registered");
        await currentUser?.getIdToken(true);
        setFormData({
          fullName: "",
          email: "",
          phoneCode: "+27",
          phoneNumber: "",
          photoUrl: "",
          role: "customer",
        });
        router.push("/dashboard/customer");
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
        Ambulance Customer Registration 🚑
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Please complete the form below to request an ambulance.
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

export default CustomerRegistrationForm;
