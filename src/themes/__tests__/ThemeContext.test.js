import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { themes } from '../ThemeContext';

// Test component that uses the theme context
function TestComponent() {
  const { theme, changeTheme, isDarkMode, toggleDarkMode } = useTheme();
  return (
    <div>
      <div data-testid="theme-name">{theme.name}</div>
      <div data-testid="is-dark-mode">{isDarkMode.toString()}</div>
      <button onClick={() => changeTheme('wood')}>Change to Wood</button>
      <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
    </div>
  );
}

describe('ThemeContext', () => {
  it('provides default theme (mui) to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-name')).toHaveTextContent('mui');
  });

  it('allows changing themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Change to Wood'));
    expect(screen.getByTestId('theme-name')).toHaveTextContent('wood');
  });

  it('allows toggling dark mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    fireEvent.click(screen.getByText('Toggle Dark Mode'));
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
  });

  it('applies dark mode color modifications', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Get initial background color
    const { theme: initialTheme } = useTheme();
    const initialBackground = initialTheme.colors.background;

    // Toggle dark mode
    fireEvent.click(screen.getByText('Toggle Dark Mode'));

    // Get updated background color
    const { theme: updatedTheme } = useTheme();
    const darkBackground = updatedTheme.colors.background;

    expect(darkBackground).toBe('#121212');
    expect(darkBackground).not.toBe(initialBackground);
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('verifies all themes have required properties', () => {
    const requiredProperties = [
      'name',
      'colors',
      'fonts',
      'shadows',
      'borderRadius'
    ];

    const requiredColors = [
      'primary',
      'secondary',
      'background',
      'surface',
      'text',
      'textSecondary',
      'border'
    ];

    Object.values(themes).forEach(theme => {
      // Check required top-level properties
      requiredProperties.forEach(prop => {
        expect(theme).toHaveProperty(prop);
      });

      // Check required color properties
      requiredColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color);
      });

      // Check font properties
      expect(theme.fonts).toHaveProperty('primary');
      expect(theme.fonts).toHaveProperty('secondary');

      // Check shadow properties
      expect(theme.shadows).toHaveProperty('small');
      expect(theme.shadows).toHaveProperty('medium');
      expect(theme.shadows).toHaveProperty('large');
    });
  });
});
