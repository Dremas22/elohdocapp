import serviceAccount from "@/db/serviceAccount.json";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const currentApps = getApps();
let db;
let auth;

if (currentApps.length <= 0) {
  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  db = getFirestore(app);
  auth = getAuth(app);
} else {
  db = getFirestore(currentApps[0]);
  auth = getAuth(currentApps[0]);
}

export { db, auth };
