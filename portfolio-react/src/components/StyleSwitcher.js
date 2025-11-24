import React from 'react';
import { FaCog, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import '../styleswitcher.css';

const StyleSwitcher = () => {
    const {
        activeColor,
        isDark,
        styleSwitcherOpen,
        setActiveStyle,
        toggleDarkMode,
        toggleStyleSwitcher
    } = useTheme();

    return (
        <div className={`style-switcher ${styleSwitcherOpen ? 'open' : ''}`}>
            <div className="style-switcher-toggler s-icon" onClick={toggleStyleSwitcher}>
                <FaCog />
            </div>
            <div className="day-night s-icon" onClick={toggleDarkMode}>
                {isDark ? <FaSun /> : <FaMoon />}
            </div>
            <h4>Theme Colors</h4>
            <div className="colors">
                <span
                    className="color-1"
                    onClick={() => setActiveStyle('color-1')}
                    style={{ borderColor: activeColor === 'color-1' ? 'var(--skin-color)' : 'red' }}
                ></span>
                <span
                    className="color-2"
                    onClick={() => setActiveStyle('color-2')}
                    style={{ borderColor: activeColor === 'color-2' ? 'var(--skin-color)' : 'red' }}
                ></span>
                <span
                    className="color-3"
                    onClick={() => setActiveStyle('color-3')}
                    style={{ borderColor: activeColor === 'color-3' ? 'var(--skin-color)' : 'red' }}
                ></span>
                <span
                    className="color-4"
                    onClick={() => setActiveStyle('color-4')}
                    style={{ borderColor: activeColor === 'color-4' ? 'var(--skin-color)' : 'red' }}
                ></span>
                <span
                    className="color-5"
                    onClick={() => setActiveStyle('color-5')}
                    style={{ borderColor: activeColor === 'color-5' ? 'var(--skin-color)' : 'red' }}
                ></span>
            </div>
        </div>
    );
};

export default StyleSwitcher;

