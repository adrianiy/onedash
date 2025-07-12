import React, { useState, useRef, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { Icon } from "@/common/Icon";

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el selector cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (selectedTheme: "light" | "dark" | "itx") => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  // Obtener el icono según el tema actual
  const getCurrentThemeIcon = () => {
    switch (theme) {
      case "light":
        return "sun";
      case "dark":
        return "moon";
      case "itx":
        return "square";
      default:
        return "sun";
    }
  };

  // Obtener el texto según el tema actual
  const getCurrentThemeText = () => {
    switch (theme) {
      case "light":
        return "Claro";
      case "dark":
        return "Oscuro";
      case "itx":
        return "ITX";
      default:
        return "Claro";
    }
  };

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="header-action-btn"
        onClick={toggleDropdown}
        title={`Tema ${getCurrentThemeText()}`}
        aria-label={`Cambiar tema, tema actual: ${getCurrentThemeText()}`}
      >
        <Icon name={getCurrentThemeIcon()} size={16} />
      </button>

      {isOpen && (
        <div className="theme-selector__dropdown">
          <button
            className={`theme-selector__option ${
              theme === "light" ? "theme-selector__option--active" : ""
            }`}
            onClick={() => handleThemeChange("light")}
          >
            <Icon name="sun" size={16} />
            <span>Claro</span>
          </button>
          <button
            className={`theme-selector__option ${
              theme === "dark" ? "theme-selector__option--active" : ""
            }`}
            onClick={() => handleThemeChange("dark")}
          >
            <Icon name="moon" size={16} />
            <span>Oscuro</span>
          </button>
          <button
            className={`theme-selector__option ${
              theme === "itx" ? "theme-selector__option--active" : ""
            }`}
            onClick={() => handleThemeChange("itx")}
          >
            <Icon name="square" size={16} />
            <span>ITX</span>
          </button>
        </div>
      )}
    </div>
  );
};
