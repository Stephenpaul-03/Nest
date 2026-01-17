import { ThemeProvider, useThemeContext } from '@/src/context/ThemeContext';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

function UIProviderContent({ children }: Props) {
  const { colorMode } = useThemeContext();

  return (
    <GluestackUIProvider
      config={config}
      colorMode={colorMode}
    >
      {children}
    </GluestackUIProvider>
  );
}

export function UIProvider({ children }: Props) {
  return (
    <ThemeProvider>
      <UIProviderContent>{children}</UIProviderContent>
    </ThemeProvider>
  );
}
