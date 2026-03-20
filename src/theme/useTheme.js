import React from "https://esm.sh/react@18.3.1";
import { DARK_THEME, LIGHT_THEME } from "./theme.js";

const STORAGE_KEY = "mindmap.themeMode.v1";

export function useTheme() {
  const [themeMode, setThemeMode] = React.useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "light";
  });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const theme = themeMode === "dark" ? DARK_THEME : LIGHT_THEME;

  return {
    themeMode,
    theme,
    setTheme: setThemeMode,
  };
}

