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
    if (
      !childhoodIllnesses.length &&
      !adultIllnesses.length &&
      !surgeries.length &&
      !hospitalizations.length &&
      !majorInjuries.length
    ) {
      errors.medicalHistory = "At least one medical history entry required.";
    }
  }

  return errors;
};
