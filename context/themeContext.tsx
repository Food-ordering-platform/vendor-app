import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof THEME.light;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: THEME.light,
  isDark: false,
  setMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // 🟢 FORCE LIGHT MODE ALWAYS
  // We ignore system settings and saved preferences to ensure consistency
  const mode = 'light';
  const colors = THEME.light;
  const isDark = false;

  const setMode = (newMode: ThemeMode) => {
    // console.log("Theme switching disabled to force Light Mode");
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);