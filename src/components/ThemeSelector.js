import React from 'react';
import { useTheme, themes } from '../themes/ThemeContext';

function ThemeSelector() {
  const { theme, changeTheme, isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="theme-selector" data-testid="theme-selector">
      <div className="theme-buttons">
        <button
          className={`theme-button ${theme.name === 'mui' ? 'active' : ''}`}
          onClick={() => changeTheme('mui')}
          style={{
            backgroundColor: themes.mui.colors.primary,
            color: '#fff',
            border: `2px solid ${theme.name === 'mui' ? themes.mui.colors.secondary : 'transparent'}`
          }}
        >
          MUI Theme
        </button>
        <button
          className={`theme-button ${theme.name === 'wood' ? 'active' : ''}`}
          onClick={() => changeTheme('wood')}
          style={{
            backgroundColor: themes.wood.colors.primary,
            color: '#fff',
            border: `2px solid ${theme.name === 'wood' ? themes.wood.colors.secondary : 'transparent'}`
          }}
        >
          Wood Theme
        </button>
        <button
          className={`theme-button ${theme.name === 'metallic' ? 'active' : ''}`}
          onClick={() => changeTheme('metallic')}
          style={{
            backgroundColor: themes.metallic.colors.primary,
            color: '#fff',
            border: `2px solid ${theme.name === 'metallic' ? themes.metallic.colors.secondary : 'transparent'}`
          }}
        >
          Metallic Theme
        </button>
      </div>
      <div className="dark-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
}

export default ThemeSelector;
