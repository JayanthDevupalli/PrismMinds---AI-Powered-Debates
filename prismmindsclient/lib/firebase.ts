"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; // optional if using storage

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxm11C5J22l8Q_NfquXBrAMEiqXU-HYDQ",
  authDomain: "prismminds-84a4f.firebaseapp.com",
  projectId: "prismminds-84a4f",
  storageBucket: "prismminds-84a4f.appspot.com", // fixed incorrect domain
  messagingSenderId: "524569796023",
  appId: "1:524569796023:web:7d777a87d8c761e30a1c32",
  measurementId: "G-M9NSGD8KHE",
};

// ✅ Initialize app only once (important for Next.js hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
// const storage = getStorage(app); // optional
// ✅ Export for use in other files
export { app, auth, googleProvider, db };
