import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_URL = "http://localhost:5000/api/debate";

async function getAuthHeader() {
  const auth = getAuth();

  // Wait for Firebase user to load
  const user = auth.currentUser || (await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      unsubscribe();
      resolve(u);
    });
  }));

  if (!user) {
    console.error("❌ No user logged in - cannot make authenticated request");
    throw new Error("User not authenticated. Please log in.");
  }

  try {
    const token = await user.getIdToken(true); // Force refresh token
    console.log("✅ Got auth token for user:", user.uid);
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error("❌ Failed to get auth token:", error);
    throw new Error("Failed to get authentication token");
  }
}

export async function fetchRecentDebates() {
  try {
    const headers = await getAuthHeader();
    console.log("🔍 Fetching recent debates from:", `${API_URL}/recent`);
    
    const res = await fetch(`${API_URL}/recent`, { 
      headers,
      method: 'GET'
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ Fetch debates failed:", { status: res.status, body });
      throw new Error(`Failed to fetch debates (${res.status}): ${msg}`);
    }

    const data = await res.json();
    console.log("✅ Fetched debates:", data);
    return data;
  } catch (error) {
    console.error("❌ Error in fetchRecentDebates:", error);
    throw error;
  }
}

export async function deleteDebate(debateId: string) {
  try {
    const headers = await getAuthHeader();
    console.log("🗑️ Deleting debate:", debateId);

    const res = await fetch(`${API_URL}/${debateId}`, {
      method: "DELETE",
      headers
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ Delete debate failed:", { status: res.status, body });
      throw new Error(`Failed to delete debate (${res.status}): ${msg}`);
    }

    console.log("✅ Debate deleted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in deleteDebate:", error);
    throw error;
  }
}

export async function createDebate(data: any) {
  try {
    const authHeaders = await getAuthHeader();
    const headers = {
      ...authHeaders,
      "Content-Type": "application/json",
    };

    console.log("🚀 Creating debate with data:", data);
    console.log("📡 Sending to:", `${API_URL}/create`);

    const res = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ Create debate failed:", { status: res.status, body });
      
      const err: any = new Error(`Failed to create debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const result = await res.json();
    console.log("✅ Debate created successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in createDebate:", error);
    throw error;
  }
}
