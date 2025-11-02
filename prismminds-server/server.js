

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { verifyFirebaseToken } from "./middleware/authMiddleware.js";
// import testRoutes from "./routes/testRoutes.js"; // ✅ Make sure this import exists
// import debateRoutes from "./routes/debateRoutes.js";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Register the test route
// app.use("/api/test", testRoutes);
// app.use("/api/debate", debateRoutes); // Example protected route
// // Example protected route
// app.get("/api/profile", verifyFirebaseToken, (req, res) => {
//   res.json({ message: "User authenticated", user: req.user });
// });

// app.listen(5000, () => console.log("✅ Server running on port 5000"));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import debateRoutes from "./routes/debateRoutes.js";

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api/test", testRoutes);
app.use("/api/debate", debateRoutes);

app.get("/", (req, res) => res.send("🔥 PrismMinds Server Running"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || "development"
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
