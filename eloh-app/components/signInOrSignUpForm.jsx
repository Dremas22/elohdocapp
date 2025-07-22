"use client";

import { useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "react-toastify";

const SignInOrSignUpForm = ({ role: selectedRole }) => {
  const { handleRegister, handleLogin, handlePasswordReset } = useCurrentUser();
  const [activeForm, setActiveForm] = useState("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = (data) => {
    const errors = {};
    const { email, password, confirmPassword } = data;

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (activeForm === "signup") {
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    setFormErrors(validate(updatedData));
  };

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

    if (activeForm === "signup") {
      await handleRegister(email, password, selectedRole);
    } else {
      await handleLogin(email, password, selectedRole);
    }
  };

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
    <div className="flex items-center justify-center w-full px-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveForm("signin")}
            className={`w-1/2 py-2 text-sm font-semibold transition ${activeForm === "signin"
              ? "bg-[#03045e] text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm("signup")}
            className={`w-1/2 py-2 text-sm font-semibold transition ${activeForm === "signup"
              ? "bg-[#03045e] text-white"
              : "bg-blue-100 text--700 blue hover:bg-blue-200"
              }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-[#03045e] mb-4">
            {activeForm === "signin"
              ? "Welcome Back 👋"
              : "Create an Account ✨"}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {activeForm === "signup" && (
              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center gap-2 py-2 shadow-[0_9px_#999] active:shadow-[0_5px_#666] text-white rounded-lg font-semibold transition ${activeForm === "signin"
                ? "bg-[#03045e] hover:bg-blue-600"
                : "bg-[#03045e] hover:bg-blue-700"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {activeForm === "signin" ? "Sign In" : "Sign Up"}
            </button>

            {activeForm === "signin" && (
              <p
                onClick={handleResetPassword}
                className="text-sm text-center text-blue-700 hover:underline cursor-pointer mt-2"
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
