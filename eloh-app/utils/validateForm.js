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
      diet = [],
      exercise = [],
      hobbies = [],
      livingSituation = [],
      isSmoker,
      smoking = { status: "never", packYears: "" },
      usesAlcohol,
      alcohol = { type: "None", frequency: "", amount: "" },
      usesDrugs,
      drugs = { type: "None", frequency: "", route: "" },
    } = socialHistory;

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

    if (!diet.length) errors.diet = "Select at least one diet option.";
    if (!exercise.length)
      errors.exercise = "Select at least one exercise option.";
    if (!hobbies.length) errors.hobbies = "Select at least one hobby.";
    if (!livingSituation.length)
      errors.livingSituation = "Select at least one living situation.";
  }

  if (step === 3 || isFinal) {
    const {
      medications = [],
      food = [],
      environmental = [],
      other = { isChecked: false, text: "" },
    } = allergies;

    if (!medications.length)
      errors.medications = "Add at least one medication allergy.";
    if (!food.length) errors.food = "Add at least one food allergy.";
    if (!environmental.length)
      errors.environmental = "Add at least one environmental allergy.";

    if (other.isChecked && !other.text.trim()) {
      errors.other = "Please specify other allergies.";
    }
  }

  if (step === 4 || isFinal) {
    const fields = [
      "childhoodIllnesses",
      "adultIllnesses",
      "surgeries",
      "hospitalizations",
      "majorInjuries",
    ];

    fields.forEach((field) => {
      if (!medicalHistory[field] || medicalHistory[field].length === 0) {
        errors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required.`;
      }
      if (medicalHistory[field]?.includes("Other")) {
        const otherField = `other${
          field.charAt(0).toUpperCase() + field.slice(1)
        }`;
        if (!medicalHistory[otherField]?.trim()) {
          errors[otherField] = `Please specify other ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}.`;
        }
      }
    });
  }

  return errors;
};
