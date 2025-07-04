import { db } from "@/db/server";
import { db as firestore } from "@/db/client";
import {
  collection,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/**
 * Fetches all documents from a specified Firestore collection.
 *
 * Each returned document includes its Firestore-generated `id` field along with the document data.
 *
 * @param {string} collectionName - The name of the Firestore collection to query.
 * @returns {Promise<object[]>} - A promise that resolves to an array of documents with `id` and data, or an empty array on failure.
 *
 * @throws {Error} - Throws an error if collectionName is missing or if fetching fails.
 */
export const fetchCollection = async (collectionName) => {
  if (!collectionName || typeof collectionName !== "string") {
    throw new Error("A valid collection name must be provided.");
  }

  try {
    const snapshot = await getDocs(collection(firestore, collectionName));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching collection "${collectionName}":`, error);
    return [];
  }
};

export const fetchServerCollection = async (collectionName) => {
  if (!collectionName || typeof collectionName !== "string") {
    throw new Error("A valid collection name must be provided.");
  }

  try {
    const snapshot = await db.collection(collectionName).get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null,
        updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    });
  } catch (error) {
    console.error(`Error fetching collection "${collectionName}":`, error);
    return [];
  }
};

/**
 * Sends a notification request to the doctor and retrieves patient data.
 *
 * @async
 * @function notifyDoctorAndGetPatient
 * @param {string} doctorId - The user ID of the doctor to notify.
 * @param {string} patientId - The user ID of the patient initiating the request.
 * @throws {Error} Throws an error if the notification request fails.
 * @returns {Promise<Object>} Resolves with the patient data object returned from the API.
 */
export async function notifyDoctorAndGetPatient(doctorId, patientId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, patientId }),
  });

  if (!res.ok) {
    throw new Error("Failed to notify doctor");
  }

  const data = await res.json();
  // data.patient contains your patient info
  return data.patient;
}

// // Usage example in React event handler
// const patientData = await notifyDoctorAndGetPatient(doc.userId, currentUser.uid);
// console.log("Patient info from API:", patientData);

/**
 * Adds or updates a document in a specified Firestore collection.
 *
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} docId - The document ID to use (e.g. userId).
 * @param {object} data - The data to store (e.g. name, role, etc.).
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const addDocumentToFirestore = async (collectionName, userId, data) => {
  if (!collectionName || typeof collectionName !== "string") {
    return {
      success: false,
      error: "A valid collection name must be provided.",
    };
  }

  if (!userId || typeof userId !== "string") {
    return { success: false, error: "A valid document ID must be provided." };
  }

  if (!data || typeof data !== "object") {
    return { success: false, error: "Valid data must be provided." };
  }

  try {
    const docRef = doc(db, collectionName, userId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Document added successfully.",
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
};

/**
 * Updates specific fields of a user document in Firestore.
 *
 * @param {string} collectionName - The name of the Firestore collection (e.g., "users").
 * @param {string} userId - The document ID (usually the user ID).
 * @param {object} updatedFields - An object with only the fields to update.
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const updateUserField = async (
  collectionName,
  userId,
  updatedFields
) => {
  if (!collectionName || typeof collectionName !== "string") {
    return {
      success: false,
      error: "A valid collection name must be provided.",
    };
  }

  if (!userId || typeof userId !== "string") {
    return { success: false, error: "A valid user ID must be provided." };
  }

  if (!updatedFields || typeof updatedFields !== "object") {
    return { success: false, error: "Valid updated fields must be provided." };
  }

  try {
    const docRef = doc(db, collectionName, userId);

    await updateDoc(docRef, {
      ...updatedFields,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "User updated successfully.",
    };
  } catch (error) {
    console.error(`Error updating user in ${collectionName}:`, error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
};
