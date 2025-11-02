// import { admin } from "../config/firebaseAdmin.js";

// export async function verifyFirebaseToken(req, res, next) {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "No token provided" });

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     res.status(403).json({ error: "Invalid token" });
//   }
// }
import { admin } from "../config/firebaseAdmin.js";

export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("🔥 Token verification failed:", error.message);
    res.status(403).json({ 
      error: "Invalid or expired token",
      message: error.message,
      code: error.code 
    });
  }
}
