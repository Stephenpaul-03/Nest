import { Slot } from 'expo-router';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/src/store';
import { UIProvider } from '@/src/utils/ui-provider';

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <UIProvider>
        <Slot />
      </UIProvider>
    </ReduxProvider>
  );
}
