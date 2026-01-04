import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import React from 'react';

type Props = {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
};

export function UIProvider({ children, mode = 'light' }: Props) {
  return (
    <GluestackUIProvider
      config={config}
      colorMode={mode}
    >
      {children}
    </GluestackUIProvider>
  );
}
