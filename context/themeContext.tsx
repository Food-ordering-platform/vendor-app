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

const ThemeContext = createContext<ThemeContextType>({} as any);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load saved preference on startup
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('app.theme');
      if (saved) setModeState(saved as ThemeMode);
    };
    loadTheme();
  }, []);

  // Save preference when it changes
  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem('app.theme', newMode);
  };

  // Determine actual active theme
  const activeMode = mode === 'system' ? (systemScheme || 'light') : mode;
  const colors = THEME[activeMode];

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark: activeMode === 'dark', setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for easy access
export const useTheme = () => useContext(ThemeContext);