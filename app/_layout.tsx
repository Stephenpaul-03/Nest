import { Slot, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, RootState, store } from '@/src/store';
import { UIProvider } from '@/src/utils/ui-provider';

function AuthHandler() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Small delay to ensure navigation is ready and persisted state is loaded
    const timer = setTimeout(() => {
      // If not authenticated and not on login page, redirect to login
      if (!isAuthenticated && !pathname.includes('/(auth)/login')) {
        // Use dynamic import to avoid SSR issues
        import('expo-router').then(({ router }) => {
          router.replace('/(auth)/login');
          hasRedirected.current = true;
        });
      }
      // If authenticated and on login page, redirect to dashboard
      else if (isAuthenticated && pathname.includes('/(auth)/login')) {
        import('expo-router').then(({ router }) => {
          router.replace('/(app)/dashboard');
          hasRedirected.current = true;
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <UIProvider>
          <AuthHandler />
          <Slot />
        </UIProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
