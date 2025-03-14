import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import ProjectView from "./components/ProjectView";
import CriteriaDefinition from "./components/CriteriaDefinition";
import FormBuilder from "./components/FormBuilder";
import AlternativeEvaluation from "./components/AlternativeEvaluation";
import { ThemeProvider, useTheme } from "./themes/ThemeContext";
import { AuthProvider, useAuth } from "./AuthContext"; // Import AuthProvider and useAuth
import Auth from "./components/Auth";
import ThemeDialog from "./components/ThemeDialog"; // Import ThemeDialog
import Header from "./components/Header";

// Wrapper component to apply theme styles
function ThemedApp({ children }) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary-color",
      theme.colors.primary
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      theme.colors.secondary
    );
    document.documentElement.style.setProperty(
      "--background-color",
      theme.colors.background
    );
    document.documentElement.style.setProperty(
      "--surface-color",
      theme.colors.surface
    );
    document.documentElement.style.setProperty(
      "--text-color",
      theme.colors.text
    );
    document.documentElement.style.setProperty(
      "--text-secondary-color",
      theme.colors.textSecondary
    );
    document.documentElement.style.setProperty(
      "--border-color",
      theme.colors.border
    );
    document.documentElement.style.setProperty("--font-primary", theme.fonts.primary);
    document.documentElement.style.setProperty(
      "--font-secondary",
      theme.fonts.secondary
    );
    document.documentElement.style.setProperty(
      "--border-radius",
      theme.borderRadius
    );

    if (theme.backgroundImage) {
      document.body.style.backgroundImage = theme.backgroundImage;
      document.body.style.backgroundSize = theme.backgroundSize || "cover";
    } else {
      document.body.style.backgroundImage = "none";
    }

    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.style.fontFamily = theme.fonts.primary;
  }, [theme]);

  return children;
}

function App() {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { session, handleSignIn } = useAuth();

  const closeThemeModal = () => {
    setIsThemeModalOpen(false);
  };

  return (
    <ThemeProvider isThemeModalOpen={isThemeModalOpen} setThemeModalOpen={setIsThemeModalOpen}>
      <ThemedApp>
        <div className="App">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                session ? <Dashboard /> : <Auth onSignIn={handleSignIn} />
              }
            />
            <Route path="/projects/:id" element={<ProjectView />} />
            <Route
              path="/projects/:id/criteria"
              element={<CriteriaDefinition />}
            />
            <Route path="/projects/:id/form" element={<FormBuilder />} />
            <Route
              path="/projects/:id/evaluate"
              element={<AlternativeEvaluation />}
            />
          </Routes>
          <ThemeDialog isOpen={isThemeModalOpen} onClose={closeThemeModal} />
        </div>
      </ThemedApp>
    </ThemeProvider>
  );
}

const WrappedApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default WrappedApp;
