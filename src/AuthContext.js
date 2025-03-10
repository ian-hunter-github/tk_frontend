import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // You might need a dedicated API endpoint to check session status
                const response = await fetch("/.netlify/functions/projects", { credentials: "include" });
                if (response.ok) {
                    // Assuming if fetching projects is successful, the user is logged in.
                    setSession({}); // Set a non-null session
                } else {
                    setSession(null);
                }
            } catch (error) {
                console.error("Error checking login status:", error);
                setSession(null);
            }
        };

        checkLoginStatus();
    }, []);

  const handleSignIn = async (username, password) => {
    try {
      const response = await authService.signIn(username, password);
      if (response.user) {
        setSession(response.user);
        navigate("/");
        return { success: true };
      } else {
        throw new Error(response.error || "Sign in failed");
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setSession(null);
      navigate("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, handleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
