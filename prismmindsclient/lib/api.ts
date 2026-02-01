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
    throw new Error("User not authenticated. Please log in.");
  }

  try {
    const token = await user.getIdToken(true); // Force refresh token
    return { Authorization: `Bearer ${token}` };
  } catch {
    throw new Error("Failed to get authentication token");
  }
}

export async function fetchRecentDebates(limit = 100) {
  try {
    const headers = await getAuthHeader();
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
      throw new Error(`Failed to fetch debates (${res.status}): ${msg}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteDebate(debateId: string) {
  try {
    const headers = await getAuthHeader();

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
      throw new Error(`Failed to delete debate (${res.status}): ${msg}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function fetchDebateById(id: string) {
  try {
    const headers = await getAuthHeader()
    const url = `${API_URL}/${id}`

    const res = await fetch(url, { headers })

    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()

    // Defensive check
    if (!data || !data.id || !data.topic) {
      throw new Error("Debate not found or still generating.")
    }

    return data
  } catch (err) {
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

      const err: any = new Error(`Failed to create debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return await res.json();
  } catch (error) {
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
      const err: any = new Error(`Failed to create human debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return await res.json();
  } catch (error) {
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

      const err: any = new Error(`Failed to send message (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return await res.json();
  } catch (error) {
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

      const err: any = new Error(`Failed to end debate (${res.status}): ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Favorites API functions - using Backend
export async function fetchFavorites() {
  try {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}/favorites/all`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      // Fallback to empty array if backend fails
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

export async function addFavorite(debateId: string) {
  try {
    const headers = await getAuthHeader();
    const payload = { debateId };

    const res = await fetch(`${API_URL}/favorite`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to add favorite: ${msg}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function removeFavorite(debateId: string) {
  try {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}/favorite/${debateId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to remove favorite: ${msg}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}


export async function generateAnalysis(debateId: string) {
  try {
    const headers = await getAuthHeader()
    const res = await fetch(`${API_URL}/${debateId}/analyze`, {
      method: "POST",
      headers,
    })

    if (!res.ok) throw new Error("Analysis failed")

    return await res.json()
  } catch (err) {
    throw err
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    let headers = {};
    try {
      headers = await getAuthHeader();
    } catch {
      // No auth header available for welcome email - proceed without
    }

    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/welcome`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    if (!res.ok) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Forgot Password / OTP Flow
export async function sendForgotPasswordEmail(email: string) {
  try {
    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to send OTP");
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Invalid OTP");
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
  try {
    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to reset password");
    }

    return true;
  } catch (error) {
    throw error;
  }
}

// Challenge API
export async function createChallenge(data: { topic: string, score: number, challengerName: string, challengerId?: string }) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/../challenge/create`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create challenge");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function getChallenge(id: string) {
  try {
    const res = await fetch(`${API_URL}/../challenge/${id}`);
    if (!res.ok) throw new Error("Challenge not found");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function acceptChallenge(id: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/../challenge/${id}/accept`, {
      method: "POST",
      headers
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to accept challenge");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchLeaderboard() {
  try {
    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/leaderboard`);

    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    return await res.json();
  } catch {
    return [];
  }
}

export async function forceRecalcStats() {
  try {
    const headers = await getAuthHeader();
    const userApiUrl = API_URL.replace("/api/debate", "/api/user");

    const res = await fetch(`${userApiUrl}/recalc-stats`, {
      method: 'POST',
      headers
    });

    if (!res.ok) throw new Error("Recalc failed");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function analyzeDebate(debateId: string) {
  try {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}/${debateId}/analyze`, {
      method: "POST",
      headers
    });

    if (!res.ok) throw new Error("Analysis failed");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Fetch Daily Challenge
export async function fetchDailyChallenge() {
  try {
    let headers = {};
    try {
      // Optimistically try to get auth header if user is logged in
      const authHeader = await getAuthHeader();
      headers = { ...authHeader };
    } catch {
      // User likely not logged in, proceed with public fetch
    }

    const res = await fetch(`${API_URL}/daily`, {
      method: 'GET',
      headers
    });

    if (!res.ok) throw new Error("Failed to fetch daily challenge");
    return await res.json();
  } catch {
    return null;
  }
}
