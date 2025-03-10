import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppMenu from './AppMenu';
import './Header.css';
import { useAuth } from '../AuthContext';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session } = useAuth();

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="logo-container">
        <Link to={session ? "/" : "/signin"}>
          Logo
        </Link>
      </div>
      <div className="title-container">
        Decision Analysis App
      </div>
      <div>
        <AppMenu toggleMenu={toggleMenu} isMobileMenuOpen={isMobileMenuOpen} />
      </div>
    </header>
  );
}

export default Header;
