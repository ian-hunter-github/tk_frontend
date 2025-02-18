import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSelector from '../ThemeSelector';
import { ThemeProvider, themes } from '../../themes/ThemeContext';

describe('ThemeSelector', () => {
  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders all theme buttons', () => {
    renderWithTheme(<ThemeSelector />);
    
    expect(screen.getByText('MUI Theme')).toBeInTheDocument();
    expect(screen.getByText('Wood Theme')).toBeInTheDocument();
    expect(screen.getByText('Metallic Theme')).toBeInTheDocument();
  });

  it('renders dark mode toggle', () => {
    renderWithTheme(<ThemeSelector />);
    
    const darkModeToggle = screen.getByRole('checkbox');
    expect(darkModeToggle).toBeInTheDocument();
    expect(darkModeToggle).not.toBeChecked();
  });

  it('applies active class to current theme button', () => {
    renderWithTheme(<ThemeSelector />);
    
    const muiButton = screen.getByRole('button', { name: 'MUI Theme' });
    const woodButton = screen.getByRole('button', { name: 'Wood Theme' });
    
    expect(muiButton).toHaveClass('active');
    expect(woodButton).not.toHaveClass('active');
  });

  it('changes theme when clicking theme buttons', () => {
    renderWithTheme(<ThemeSelector />);
    
    const woodButton = screen.getByRole('button', { name: 'Wood Theme' });
    fireEvent.click(woodButton);
    
    expect(woodButton).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'MUI Theme' })).not.toHaveClass('active');
  });

  it('toggles dark mode', () => {
    renderWithTheme(<ThemeSelector />);
    
    const darkModeToggle = screen.getByRole('checkbox');
    fireEvent.click(darkModeToggle);
    
    expect(darkModeToggle).toBeChecked();
  });

  it('applies correct styles based on theme', () => {
    renderWithTheme(<ThemeSelector />);
    
    // Check MUI theme button styles
    const muiButton = screen.getByRole('button', { name: 'MUI Theme' });
    expect(muiButton).toHaveStyle({
      backgroundColor: themes.mui.colors.primary
    });

    // Check Wood theme button styles
    const woodButton = screen.getByRole('button', { name: 'Wood Theme' });
    expect(woodButton).toHaveStyle({
      backgroundColor: themes.wood.colors.primary
    });

    // Check Metallic theme button styles
    const metallicButton = screen.getByRole('button', { name: 'Metallic Theme' });
    expect(metallicButton).toHaveStyle({
      backgroundColor: themes.metallic.colors.primary
    });
  });

  it('maintains theme selection after dark mode toggle', () => {
    renderWithTheme(<ThemeSelector />);
    
    // Select Wood theme
    const woodButton = screen.getByRole('button', { name: 'Wood Theme' });
    fireEvent.click(woodButton);
    expect(woodButton).toHaveClass('active');

    // Toggle dark mode
    const darkModeToggle = screen.getByRole('checkbox');
    fireEvent.click(darkModeToggle);

    // Wood theme should still be selected
    expect(woodButton).toHaveClass('active');
  });

  it('applies hover styles to theme buttons', () => {
    renderWithTheme(<ThemeSelector />);
    
    const woodButton = screen.getByRole('button', { name: 'Wood Theme' });
    
    // Simulate hover
    fireEvent.mouseEnter(woodButton);
    expect(woodButton).toHaveStyle({
      transform: 'translateY(-2px)'
    });

    // Simulate hover end
    fireEvent.mouseLeave(woodButton);
    expect(woodButton).not.toHaveStyle({
      transform: 'translateY(-2px)'
    });
  });

  it('renders in a fixed position', () => {
    renderWithTheme(<ThemeSelector />);
    
    const themeSelector = screen.getByTestId('theme-selector');
    
    expect(themeSelector).toHaveStyle({
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '1000'
    });
  });
});
