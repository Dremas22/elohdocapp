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
      smoking,
      alcohol,
      drugs,
      diet,
      exercise,
      hobbies,
      livingSituation,
    } = socialHistory;
    if (!smoking.status) errors.smokingStatus = "Smoking status required.";
    if (smoking.status !== "never" && !smoking.packYears) {
      errors.packYears = "Pack years required for smokers.";
    }
    if (!alcohol.type) errors.alcoholType = "Alcohol type required.";
    if (!alcohol.frequency)
      errors.alcoholFrequency = "Alcohol frequency required.";
    if (!alcohol.amount) errors.alcoholAmount = "Alcohol amount required.";
    if (!drugs.type) errors.drugType = "Drug type required.";
    if (!drugs.frequency) errors.drugFrequency = "Drug frequency required.";
    if (!drugs.route) errors.drugRoute = "Drug route required.";
    if (!diet) errors.diet = "Diet is required.";
    if (!exercise) errors.exercise = "Exercise is required.";
    if (!hobbies) errors.hobbies = "Hobbies required.";
    if (!livingSituation) errors.livingSituation = "Living situation required.";
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
