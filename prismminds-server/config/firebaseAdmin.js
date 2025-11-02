// config/firebaseAdmin.js
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth(); // ✅ create the auth instance
const db = admin.firestore(); // (optional for later use)

export { admin, auth, db }; // ✅ export all
