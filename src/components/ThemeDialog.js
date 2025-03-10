import React, { useContext } from 'react';
import { ThemeContext, themes } from '../themes/ThemeContext';
import './ThemeDialog.css';

function ThemeDialog({ isOpen, onClose }) {
  const { changeTheme, theme } = useContext(ThemeContext);

  if (!isOpen) return null;

  return (
    <div className="theme-dialog-overlay">
      <div className="theme-dialog">
        <h2>Select a Theme</h2>
        <div className="theme-options">
          {Object.keys(themes).map((themeName) => (
            <button
              key={themeName}
              className={`theme-option ${themeName === theme.name ? 'selected' : ''}`}
              onClick={() => {
                changeTheme(themeName);
                onClose();
              }}
            >
              {themes[themeName].name}
            </button>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ThemeDialog;
