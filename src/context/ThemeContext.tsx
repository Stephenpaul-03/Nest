import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@theme-color-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize color mode from storage
  useEffect(() => {
    const initColorMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark') {
          setColorModeState(storedMode);
        }
      } catch (error) {
        console.log('Error loading color mode:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initColorMode();
  }, []);

  // Update storage when color mode changes
  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch((error: unknown) => {
      console.log('Error saving color mode:', error);
    });
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  }, [colorMode, setColorMode]);

  // Don't render children until we've checked storage
  // This prevents flash of incorrect theme
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

