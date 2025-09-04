import { storage } from "@/db/client";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 *
 * @param {File} file - The file to upload.
 * @param {Object} [options] - Optional settings for the upload.
 * @param {function({progress: number, state: string, bytesTransferred: number, totalBytes: number}): void} [options.onProgress] - Callback for upload progress.
 * @returns {Promise<string>} - Resolves with the download URL of the uploaded file.
 *
 * @example
 * upload(file, {
 *   onProgress: ({ progress }) => console.log(`Upload is ${progress}% done`)
 * }).then(url => console.log("File available at:", url));
 */
const upload = async (file, userId, options) => {
  const storageRef = ref(
    storage,
    `users/${userId}/images/${Date.now()}-${file.name}`
  );
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressData = {
          progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          state: snapshot.state,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        };

        // pass progress back to caller
        if (options && typeof options.onProgress === "function") {
          options.onProgress(progressData);
        }
      },
      (error) => {
        reject(new Error("Upload failed: " + error.code));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

export default upload;
