import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { LightColors, DarkColors } from "@/constants/theme";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof LightColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("dark");

  useEffect(() => {
    // Load persisted theme
    SecureStore.getItemAsync("app_theme").then((savedTheme) => {
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      } else if (systemScheme) {
        setThemeState(systemScheme);
      }
    });
  }, [systemScheme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    SecureStore.setItemAsync("app_theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const colors = theme === "light" ? LightColors : DarkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
