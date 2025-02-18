import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import CriteriaDefinition from './components/CriteriaDefinition';
import FormBuilder from './components/FormBuilder';
import AlternativeEvaluation from './components/AlternativeEvaluation';
import ThemeSelector from './components/ThemeSelector';
import { ThemeProvider, useTheme } from './themes/ThemeContext';
import { authService } from './services/auth';

// Wrapper component to apply theme styles
function ThemedApp({ children }) {
  const { theme } = useTheme();

  useEffect(() => {
    // Update CSS variables based on theme
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
    document.documentElement.style.setProperty('--background-color', theme.colors.background);
    document.documentElement.style.setProperty('--surface-color', theme.colors.surface);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    document.documentElement.style.setProperty('--text-secondary-color', theme.colors.textSecondary);
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    document.documentElement.style.setProperty('--font-primary', theme.fonts.primary);
    document.documentElement.style.setProperty('--font-secondary', theme.fonts.secondary);
    document.documentElement.style.setProperty('--border-radius', theme.borderRadius);
    
    // Apply theme-specific background
    if (theme.backgroundImage) {
      document.body.style.backgroundImage = theme.backgroundImage;
      document.body.style.backgroundSize = theme.backgroundSize || 'cover';
    } else {
      document.body.style.backgroundImage = 'none';
    }
    
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.style.fontFamily = theme.fonts.primary;
  }, [theme]);

  return children;
}

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { message } = await authService.signUp(email, password);
      alert(message);
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn(email, password);
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign Up / Sign In</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Sign Up
        </button>
        <button onClick={handleSignIn} disabled={loading}>
          Sign In
        </button>
      </form>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session } = await authService.getSession();
        setSession(session);
      } catch (error) {
        console.error('Session check failed:', error);
        setSession(null);
      }
    };

    checkSession();
    // Poll for session changes every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <ThemedApp>
          <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/criteria">Criteria Definition</Link>
            </li>
            <li>
              <Link to="/evaluation">Alternative Evaluation</Link>
            </li>
            {session && (
              <li>
                <button onClick={handleSignOut}>Sign Out</button>
              </li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={session ? <Dashboard /> : <Auth />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/projects/:id/criteria" element={<CriteriaDefinition />} />
          <Route path="/projects/:id/form" element={<FormBuilder />} />
          <Route path="/projects/:id/evaluate" element={<AlternativeEvaluation />} />
          </Routes>
          <ThemeSelector />
          </div>
        </ThemedApp>
      </Router>
    </ThemeProvider>
  );
}

export default App;
