import React, { useState, useEffect, useContext } from "react";
import "./AppMenu.css";
import { useAuth } from "../AuthContext";
import { ThemeContext } from "../themes/ThemeContext";

function AppMenu({ toggleMenu, isMobileMenuOpen }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { setThemeModalOpen } = useContext(ThemeContext);
  const { session, handleSignOut } = useAuth();

    const handleThemeClick = () => {
        setThemeModalOpen(true);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className={`app-menu ${session ? "" : "disabled-links"}`}>
            {isSmallScreen ? (
                <>
                    <button className="hamburger-button" onClick={toggleMenu}>
                        <span className="hamburger-icon"></span>
                        <span className="hamburger-icon"></span>
                        <span className="hamburger-icon"></span>
                    </button>
                    {isMobileMenuOpen && (
                        <div className="dropdown-menu">
                            <button
                                onClick={() => {
                                    handleThemeClick();
                                    toggleMenu();
                                }}
                            >
                                Set Theme
                            </button>
                            <button
                                onClick={() => {
                                    handleSignOut();
                                    toggleMenu();
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="menu-links">
                    <button onClick={handleThemeClick}>Set Theme</button>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            )}
        </div>
    );
}

export default AppMenu;
