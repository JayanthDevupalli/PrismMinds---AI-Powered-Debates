// Test API connectivity
export async function testServerConnection() {
  const serverUrl = "http://localhost:5000";
  
  try {
    console.log("🔍 Testing server connection...");
    
    // Test 1: Basic server health
    const healthRes = await fetch(`${serverUrl}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`Health check failed: ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    console.log("✅ Server health check passed:", healthData);
    
    // Test 2: Test database connection
    const dbRes = await fetch(`${serverUrl}/api/test/test-db`);
    if (!dbRes.ok) {
      throw new Error(`DB test failed: ${dbRes.status}`);
    }
    const dbData = await dbRes.json();
    console.log("✅ Database connection test passed:", dbData);
    
    return { success: true, health: healthData, db: dbData };
  } catch (error) {
    console.error("❌ Server connection test failed:", error);
    return { success: false, error };
  }
}