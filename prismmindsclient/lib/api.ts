import { getAuth, onAuthStateChanged } from "firebase/auth";

// const API_URL = "http://localhost:5000/api/debate";
const API_URL = "https://prismmindsdb.onrender.com/api/debate";

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

export async function fetchRecentDebates(limit = 100) {
  try {
    const headers = await getAuthHeader();
    console.log("🔍 Fetching recent debates from:", `${API_URL}/recent?limit=${limit}`);
    const res = await fetch(`${API_URL}/recent?limit=${limit}`, {
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

export async function fetchDebateById(id: string) {
  try {
    const headers = await getAuthHeader()
    const url = `${API_URL}/${id}`
    console.log("🔍 Fetching debate by ID from:", url)

    const res = await fetch(url, { headers })

    if (!res.ok) {
      const msg = `Backend responded with ${res.status}: ${res.statusText}`
      console.error(msg)
      throw new Error(msg)
    }

    const data = await res.json()
    console.log("📦 Backend returned:", data)

    // ✅ Defensive check
    if (!data || !data.id || !data.topic) {
      console.warn("⚠️ Backend returned empty or invalid debate:", data)
      throw new Error("Debate not found or still generating.")
    }

    return data
  } catch (err) {
    console.error("❌ fetchDebateById error:", err)
    throw err
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

export async function createHumanDebate(topic: string) {
  try {
    const authHeaders = await getAuthHeader();
    const headers = {
      ...authHeaders,
      "Content-Type": "application/json",
    };

    console.log("🚀 Creating human-to-AI debate with topic:", topic);
    console.log("📡 Sending to:", `${API_URL}/create-human`);

    const res = await fetch(`${API_URL}/create-human`, {
      method: "POST",
      headers,
      body: JSON.stringify({ topic }),
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ Create human debate failed:", { status: res.status, body });
      const err: any = new Error(`Failed to create human debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const result = await res.json();
    console.log("✅ Human debate created successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in createHumanDebate:", error);
    throw error;
  }
}

export async function sendHumanMessage(debateId: string, message: string) {
  try {
    const authHeaders = await getAuthHeader();
    const headers = {
      ...authHeaders,
      "Content-Type": "application/json",
    };

    console.log("💬 Sending human message:", message);
    console.log("📡 Sending to:", `${API_URL}/${debateId}/message`);

    const res = await fetch(`${API_URL}/${debateId}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ Send message failed:", { status: res.status, body });

      const err: any = new Error(`Failed to send message (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const result = await res.json();
    console.log("✅ AI response received:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in sendHumanMessage:", error);
    throw error;
  }
}

export async function endHumanDebate(debateId: string) {
  try {
    const authHeaders = await getAuthHeader();
    const headers = {
      ...authHeaders,
      "Content-Type": "application/json",
    };

    console.log("🛑 Ending human debate:", debateId);
    console.log("📡 Sending to:", `${API_URL}/${debateId}/end`);

    const res = await fetch(`${API_URL}/${debateId}/end`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (_) {
        body = await res.text().catch(() => null);
      }
      const msg = body?.error || body?.message || res.statusText || "Unknown error";
      console.error("❌ End debate failed:", { status: res.status, body });

      const err: any = new Error(`Failed to end debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const result = await res.json();
    console.log("✅ Debate ended successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in endHumanDebate:", error);
    throw error;
  }
}

// Favorites API functions - using Backend
export async function fetchFavorites() {
  try {
    const headers = await getAuthHeader();
    console.log("🔍 Fetching user favorites from backend");

    const res = await fetch(`${API_URL}/favorites/all`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch favorites:", res.status, res.statusText);
      // Fallback to empty array if backend fails, or throw
      return [];
    }

    const favorites = await res.json();
    console.log("✅ Fetched favorites:", favorites);
    return favorites;
  } catch (error) {
    console.error("❌ Error in fetchFavorites:", error);
    throw error;
  }
}

export async function addFavorite(debateId: string) {
  try {
    const headers = await getAuthHeader();
    const payload = { debateId };

    console.log("❤️ Adding favorite to backend:", debateId);

    const res = await fetch(`${API_URL}/favorite`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to add favorite: ${msg}`);
    }

    console.log("✅ Favorite added successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in addFavorite:", error);
    throw error;
  }
}

export async function removeFavorite(debateId: string) {
  try {
    const headers = await getAuthHeader();
    console.log("💔 Removing favorite from backend:", debateId);

    const res = await fetch(`${API_URL}/favorite/${debateId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to remove favorite: ${msg}`);
    }

    console.log("✅ Favorite removed successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in removeFavorite:", error);
    throw error;
  }
}
