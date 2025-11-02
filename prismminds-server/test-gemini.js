import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
  console.log("🔍 Testing Gemini API...");
  console.log("API Key:", process.env.GEMINI_API_KEY ? `✅ Found (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : "❌ Missing");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ No API key found in .env file");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelNames = [
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro",
      "models/gemini-1.5-pro-latest",
      "models/gemini-1.5-flash-latest",
      "models/gemini-pro"
    ];
    
    console.log("\n📋 Testing available models...\n");
    
    for (const modelName of modelNames) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'OK' in one word");
        const text = result.response.text();
        console.log(`✅ ${modelName} WORKS! Response: ${text}\n`);
        return; // Exit on first success
      } catch (e) {
        console.log(`❌ ${modelName} failed: ${e.message}\n`);
      }
    }
    
    console.error("\n💥 All models failed. Your API key may be invalid or restricted.");
    console.log("\n🔧 Solutions:");
    console.log("1. Get a new API key from: https://makersuite.google.com/app/apikey");
    console.log("2. Make sure the API key has Gemini API access enabled");
    console.log("3. Check if there are any billing/quota issues");
    
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

testGemini();