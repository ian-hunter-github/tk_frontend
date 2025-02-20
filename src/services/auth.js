import { config } from "../config";

export const authService = {
  async signUp(email, password) {
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

    return response.json();
  },

  async signIn(email, password) {
    const response = await fetch(`${config.API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign in");
    }

    return response.json();
  },

  async signOut() {
    const response = await fetch(`${config.API_URL}/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign out");
    }

    return response.json();
  },

  async getSession() {
    const response = await fetch(`${config.API_URL}/auth/session`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get session");
    }

    return response.json();
  },
};
