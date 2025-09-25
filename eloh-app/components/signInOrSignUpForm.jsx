"use client";

import { useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";
import { auth } from "@/db/client";
import { handleAuthAction } from "@/lib/session-signout";

const SignInOrSignUpForm = ({ role: selectedRole }) => {
  // Destructure auth handlers from custom hook
  const { handleRegister, handleLogin, handlePasswordReset } = useCurrentUser();

  // Track active form: "signin" or "signup"
  const [activeForm, setActiveForm] = useState("signin");

  // Form submission and validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation function
  const validate = (data) => {
    const errors = {};
    const { email, password, confirmPassword } = data;

    // Email validation
    if (!email) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = " (e.g. yourname@example.com).";
    }

    // Password validation
    if (!password) {
      errors.password = "Please enter your password to continue.";
    } else if (password.length < 6) {
      errors.password = "Your password should be at least 6 characters long.";
    }

    // Confirm password validation (signup only)
    if (activeForm === "signup") {
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    return errors;
  };

  // Handle input changes and validate in real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    setFormErrors(validate(updatedData));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const { email, password } = formData;

    // Custom auth action handler
    await handleAuthAction(setIsSubmitting);

    if (activeForm === "signup") {
      await handleRegister(email, password, selectedRole);
    } else {
      await handleLogin(email, password, selectedRole);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      await handlePasswordReset(formData.email);
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error("Failed to send reset email.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full pl-3 px-4">
      {/* Form container */}
      <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-10">
        {/* Form toggle buttons */}
        <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveForm("signin")}
            title="Switch to Sign In form"
            className={`w-1/2 py-2 text-sm md:text-base font-semibold transition cursor-pointer ${activeForm === "signin"
              ? "bg-[#03045e] text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm("signup")}
            title="Switch to Sign Up form"
            className={`w-1/2 py-2 text-sm md:text-base font-semibold transition cursor-pointer ${activeForm === "signup"
              ? "bg-[#03045e] text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {/* Form heading */}
          <h2 className="text-lg md:text-xl font-bold text-center text-[#03045e] mb-4">
            {activeForm === "signin" ? "Welcome Back 👋" : "Create an Account ✨"}
          </h2>

          {/* Form fields */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                title="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm md:text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.email && (
                <p className="text-xs md:text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                title="Enter your password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm md:text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.password && (
                <p className="text-xs md:text-sm text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input (signup only) */}
            {activeForm === "signup" && (
              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  title="Re-enter your password to confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm md:text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {formErrors.confirmPassword && (
                  <p className="text-xs md:text-sm text-red-500 mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              title={activeForm === "signin" ? "Sign into your account" : "Create a new account"}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-disabled={isSubmitting}
              className={`w-full flex justify-center items-center gap-2 py-2 text-sm md:text-base shadow-[0_9px_#999] active:shadow-[0_5px_#666] text-white rounded-lg font-semibold transition cursor-pointer ${activeForm === "signin" ? "bg-[#03045e] hover:bg-blue-600" : "bg-[#03045e] hover:bg-blue-700"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isSubmitting
                ? activeForm === "signin"
                  ? "Signing In..."
                  : "Signing Up..."
                : activeForm === "signin"
                  ? "Sign In"
                  : "Sign Up"}
            </button>

            {/* Forgot Password Link */}
            {activeForm === "signin" && (
              <p
                onClick={handleResetPassword}
                title="Reset your password via email"
                className="text-xs md:text-sm text-center text-blue-700 hover:underline cursor-pointer mt-2"
              >
                Forgot your password?
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInOrSignUpForm;
