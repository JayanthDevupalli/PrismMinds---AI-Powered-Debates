import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import challengeRoutes from "./routes/challengeRoutes.js";
import debateRoutes from "./routes/debateRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import annotationRoutes from "./routes/annotationRoutes.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();

// Enhanced CORS configuration
app.use(cors({
  // origin: "http://localhost:3000",
  origin: "https://prismminds.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Only log requests in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// app.use("/api/test", testRoutes);
app.use("/api/debate", debateRoutes);
app.use("/api/user", userRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/annotations", annotationRoutes);

app.get("/", (req, res) => res.send("PrismMinds Server is on AIR Jayanth, Rock the show!"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || "production"
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Only log errors in development
  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled error:", err.message);
  }
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV !== "production" ? err.message : "An error occurred"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));