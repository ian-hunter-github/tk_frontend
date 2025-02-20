import { config } from "../config";

// Helper function to get the session token from cookies
function getTokenFromCookie() {
    const cookieString = document.cookie || '';
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const projectRef = localStorage.getItem('supabaseProjectRef');
    if (!projectRef) {
      return null;
    }
    const sessionCookieName = `sb-${projectRef}-auth-token`;
    return cookies[sessionCookieName];
}

export const authService = {
  async signUp(email, password) {
    if (config.DEBUG) {
      console.log("[authService] signUp called with:", email, password);
    }
    const response = await fetch(`${config.NETLIFY_FUNC_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign up");
    }

    const result = await response.json();
    if (config.DEBUG) {
      console.log("[authService] signUp result:", result);
    }
    return result;
  },

  async signIn(email, password) {
    if (config.DEBUG) {
      console.log("[authService] signIn called with:", email, password);
    }
    const response = await fetch(`${config.NETLIFY_FUNC_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include" // ✅ Ensures cookies are stored!
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign in");
    }

    const result = await response.json();
    if (config.DEBUG) {
      console.log("[authService] signIn result:", result);
    }
    // Store the projectRef in local storage
    localStorage.setItem('supabaseProjectRef', result.projectRef);
    return result;
  },

  async signOut() {
    if (config.DEBUG) {
      console.log("[authService] signOut called");
    }
     // Clear projectRef on sign out
    localStorage.removeItem('supabaseProjectRef');
    const response = await fetch(`${config.NETLIFY_FUNC_URL}/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign out");
    }

    const result = await response.json();
    if (config.DEBUG) {
      console.log("[authService] signOut result:", result);
    }
    return result;
  },

  async getSession() {
    if (config.DEBUG) {
      console.log("[authService] getSession called");
    }
    const token = getTokenFromCookie();
    if (!token) {
      if (config.DEBUG) {
        console.log("[authService] No token found");
      }
      throw new Error("No session token found"); // Consistent with original error
    }
    const response = await fetch(`${config.NETLIFY_FUNC_URL}/session`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get session");
    }

    const result = await response.json();
    if (config.DEBUG) {
      console.log("[authService] getSession result:", result);
    }
    return result;
  },
};
