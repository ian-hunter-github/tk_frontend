import React from 'react';
import ThemeSelector from './ThemeSelector';

function ThemeModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Select Theme</h3>
        <ThemeSelector />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ThemeModal;
