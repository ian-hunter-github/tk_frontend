import React, { createContext, useContext, useState } from 'react';
import { woodPattern, metallicPattern } from './patterns';
import '../styles/fonts.css';

const ThemeContext = createContext();

export const themes = {
  mui: {
    name: 'mui',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0'
    },
    fonts: {
      primary: 'Roboto, sans-serif',
      secondary: 'Roboto, sans-serif'
    },
    shadows: {
      small: '0 2px 4px rgba(0,0,0,0.1)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      large: '0 8px 16px rgba(0,0,0,0.1)'
    },
    borderRadius: '4px'
  },
  wood: {
    name: 'wood',
    colors: {
      primary: '#8B4513',
      secondary: '#A0522D',
      background: '#FFF8DC',
      surface: '#FAEBD7',
      text: '#3E2723',
      textSecondary: '#5D4037',
      border: '#DEB887'
    },
    fonts: {
      primary: 'Merriweather, serif',
      secondary: 'Lora, serif'
    },
    shadows: {
      small: '0 2px 4px rgba(139,69,19,0.1)',
      medium: '0 4px 6px rgba(139,69,19,0.1)',
      large: '0 8px 16px rgba(139,69,19,0.1)'
    },
    borderRadius: '8px',
    backgroundImage: woodPattern,
    backgroundOverlay: 'rgba(255, 248, 220, 0.9)',
    backgroundSize: '100px 100px'
  },
  metallic: {
    name: 'metallic',
    colors: {
      primary: '#607D8B',
      secondary: '#546E7A',
      background: '#ECEFF1',
      surface: '#CFD8DC',
      text: '#263238',
      textSecondary: '#455A64',
      border: '#B0BEC5'
    },
    fonts: {
      primary: 'Rajdhani, sans-serif',
      secondary: 'Orbitron, sans-serif'
    },
    shadows: {
      small: '0 2px 4px rgba(96,125,139,0.2)',
      medium: '0 4px 6px rgba(96,125,139,0.2)',
      large: '0 8px 16px rgba(96,125,139,0.2)'
    },
    borderRadius: '2px',
    backgroundImage: metallicPattern,
    backgroundSize: '100px 100px'
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(themes.mui);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themes[themeName]);
  };

  // Apply dark mode modifications to the current theme
  const theme = {
    ...currentTheme,
    colors: {
      ...currentTheme.colors,
      background: isDarkMode ? '#121212' : currentTheme.colors.background,
      surface: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
      text: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
      textSecondary: isDarkMode ? '#AAAAAA' : currentTheme.colors.textSecondary,
      border: isDarkMode ? '#333333' : currentTheme.colors.border
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
