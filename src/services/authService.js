import { config } from "../config";

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=" + window.location.hostname;
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
      credentials: "include",
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
      credentials: "include", // ✅ Ensures cookies are sent & received
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign in");
    }

    if (config.DEBUG) {
      console.log("[authService] signIn response:", response);
    }

    const result = await response.json();
    if (config.DEBUG) {
      console.log("[authService] signIn result:", result);
    }

    setCookie("sb-auth-token", result.user.access_token, 1);

    return result;
  },

  async signOut() {
    if (config.DEBUG) console.log("[authService] signOut called");

    // Clear projectRef on sign out
    localStorage.removeItem("supabaseProjectRef");
    const response = await fetch(`${config.NETLIFY_FUNC_URL}/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
};

export const signOut = authService.signOut;
