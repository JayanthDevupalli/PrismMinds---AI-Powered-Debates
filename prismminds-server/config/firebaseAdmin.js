// // config/firebaseAdmin.js
// import admin from "firebase-admin";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const serviceAccount = require("./serviceAccountKey.json");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const auth = admin.auth(); // ✅ create the auth instance
// const db = admin.firestore(); // (optional for later use)

// export { admin, auth, db }; // ✅ export all





// config/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process
        .env
        .FIREBASE_PRIVATE_KEY
        ?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

export { admin, auth, db };
