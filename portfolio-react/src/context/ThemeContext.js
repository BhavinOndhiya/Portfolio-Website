import React, { createContext, useContext, useState, useEffect } from "react";

const colorPalette = {
  "color-1": "#ec1839",
  "color-2": "#fa5b0f",
  "color-3": "#37b182",
  "color-4": "#1854b4",
  "color-5": "#f021b2",
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [activeColor, setActiveColor] = useState("color-1");
  const [isDark, setIsDark] = useState(false);
  const [styleSwitcherOpen, setStyleSwitcherOpen] = useState(false);

  useEffect(() => {
    // Apply active color
    document.documentElement.style.setProperty(
      "--skin-color",
      colorPalette[activeColor]
    );
  }, [activeColor]);

  useEffect(() => {
    // Apply dark mode
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // Close style switcher on scroll
    const handleScroll = () => {
      if (styleSwitcherOpen) {
        setStyleSwitcherOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [styleSwitcherOpen]);

  const setActiveStyle = (color) => {
    setActiveColor(color);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const toggleStyleSwitcher = () => {
    setStyleSwitcherOpen(!styleSwitcherOpen);
  };

  return (
    <ThemeContext.Provider
      value={{
        activeColor,
        isDark,
        styleSwitcherOpen,
        setActiveStyle,
        toggleDarkMode,
        toggleStyleSwitcher,
        colors: colorPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
