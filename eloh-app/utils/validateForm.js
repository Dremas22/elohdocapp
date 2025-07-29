/**
 * Validates multi-step form data for patient intake.
 *
 * Validation is conditional based on the current step, but can also validate the entire form if `isFinal` is `true`.
 *
 * Steps:
 * - Step 0: Validates `idNumber`
 * - Step 1: Validates location (`country`, `city`, `addressLine`), `phoneNumber`, and `email`
 * - Step 2: Normalizes and prepares social history data (e.g., smoking, alcohol use)
 * - Step 3: Ensures at least one allergy is provided
 * - Step 4: Checks that all required medical history fields are filled
 *
 * @param {number} step - The current step of the form being validated (0–4).
 * @param {Object} formData - The complete form data for the patient.
 * @param {boolean} [isFinal=false] - Whether to validate the entire form regardless of the step.
 * @returns {Object} An object containing validation errors. Keys correspond to field names and values are error messages.
 *
 * @example
 * const errors = validateStep(1, formData);
 * if (Object.keys(errors).length) {
 *   // Show errors to user
 * }
 */

export const validateStep = (step, formData, isFinal = false) => {
  const errors = {};
  const {
    idNumber,
    location,
    phoneNumber,
    email,
    socialHistory,
    allergies,
    medicalHistory,
  } = formData;

  if (step === 0 || isFinal) {
    if (!idNumber.trim()) errors.idNumber = "ID number is required.";
    else if (!/^\d{13}$/.test(idNumber.trim()))
      errors.idNumber = "Must be 13 digits.";
  }

  if (step === 1 || isFinal) {
    if (!location.country.trim()) errors.country = "Country is required.";
    if (!location.city.trim()) errors.city = "City is required.";
    if (!location.addressLine.trim())
      errors.addressLine = "Address is required.";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    else if (!/^\d{9}$/.test(phoneNumber))
      errors.phoneNumber = "Must be 9 digits.";
    if (!email.trim()) errors.email = "Email is required.";
  }

  if (step === 2 || isFinal) {
    const {
      isSmoker = false,
      smoking = { status: "never", packYears: "" },
      usesAlcohol = false,
      alcohol = { type: "None", frequency: "", amount: "" },
      usesDrugs = false,
      drugs = { type: "None", frequency: "", route: "" },
      diet = "",
      exercise = "",
      hobbies = "",
      livingSituation = "",
    } = formData.socialHistory;

    // Optional: Normalize data to avoid undefined issues later
    socialHistory.smoking = smoking;
    socialHistory.alcohol = alcohol;
    socialHistory.drugs = drugs;
    socialHistory.diet = diet || "";
    socialHistory.exercise = exercise || "";
    socialHistory.hobbies = hobbies || "";
    socialHistory.livingSituation = livingSituation || "";
    socialHistory.isSmoker = isSmoker;
    socialHistory.usesAlcohol = usesAlcohol;
    socialHistory.usesDrugs = usesDrugs;
  }

  if (step === 3 || isFinal) {
    const { medications, food, environmental, other } = allergies;
    if (
      !medications.length &&
      !food.length &&
      !environmental.length &&
      !other.length
    ) {
      errors.allergies = "Add at least one allergy.";
    }
  }

  if (step === 4 || isFinal) {
    const {
      childhoodIllnesses,
      adultIllnesses,
      surgeries,
      hospitalizations,
      majorInjuries,
    } = medicalHistory;

    if (!childhoodIllnesses.length) {
      errors.childhoodIllnesses = "Childhood illnesses are required.";
    }

    if (!adultIllnesses.length) {
      errors.adultIllnesses = "Adult illnesses are required.";
    }

    if (!surgeries.length) {
      errors.surgeries = "Surgical history is required.";
    }

    if (!hospitalizations.length) {
      errors.hospitalizations = "Hospitalization history is required.";
    }

    if (!majorInjuries.length) {
      errors.majorInjuries = "Major injuries history is required.";
    }
  }

  return errors;
};
