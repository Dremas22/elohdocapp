export const saveDiagnosis = async ({ userId = null, symptoms, diagnosis }) => {
  try {
    const docRef = await addDoc(collection(db, "diagnoses"), {
      userId,
      symptoms,
      diagnosis,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnosis:", error);
    throw error;
  }
};
