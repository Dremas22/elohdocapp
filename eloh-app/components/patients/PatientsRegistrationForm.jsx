"use client";

import { useState, useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Step1BasicInfo from "./forms/Step1BasicInfo";
import Step2ContactInfo from "./forms/Step2ContactInfo";
import Step3SocialHistory from "./forms/Step3SocialHistory";
import Step4Allergies from "./forms/Step4Allergies";
import Step5MedicalHistory from "./forms/Step5MedicalHistory";
import { validateStep } from "@/utils/validateForm";
import ProgressBar from "./ProgressBar";

const steps = [
  Step1BasicInfo,
  Step2ContactInfo,
  Step3SocialHistory,
  Step4Allergies,
  Step5MedicalHistory,
];

const PatientsRegistrationForm = () => {
  const { loading, currentUser } = useCurrentUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const initialFormData = {
    idNumber: "",
    location: { country: "", city: "", addressLine: "" },
    phoneCode: "+27",
    phoneNumber: "",
    role: "patient",
    email: "",

    medicalHistory: {
      childhoodIllnesses: [],
      adultIllnesses: [],
      surgeries: [],
      hospitalizations: [],
      majorInjuries: [],
      sickNotes: [],
      prescriptions: [],
      generalNotes: [],
    },

    socialHistory: {
      isSmoker: false,
      smoking: { status: "never", packYears: "" },
      usesAlcohol: false,
      alcohol: { type: "none", frequency: "", amount: "" },
      usesDrugs: false,
      drugs: { type: "none", frequency: "", route: "" },
      diet: "",
      exercise: "",
      hobbies: "",
      livingSituation: "",
    },

    allergies: {
      medications: [],
      food: [],
      environmental: [],
      other: [],
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || "",
        photoUrl: currentUser.photoURL || "",
      }));
    }
  }, [currentUser]);

  const CurrentStepComponent = steps[currentStep];

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
    } else {
      setErrors({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const finalErrors = validateStep(currentStep, formData, true);
    setErrors(finalErrors);

    if (Object.keys(finalErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        phoneNumber: `${formData.phoneCode}${formData.phoneNumber}`,
        userId: currentUser?.uid,
        fullName: currentUser?.displayName,
        email: currentUser?.email,
        role: "patient",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/register-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (res.status === 200 || res.status === 201) {
        setFormData(initialFormData);
        router.push("/dashboard/patient");
      } else {
        console.error(result.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <p className="text-center text-black py-10">Loading...</p>;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 bg-white rounded-3xl transition-all duration-500">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Patients Registration Form
      </h2>

      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        steps={["Personal", "Contact", "Social", "Allergies", "Medical"]}
      />

      <CurrentStepComponent
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />

      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientsRegistrationForm;
