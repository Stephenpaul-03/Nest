import { Slot, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, RootState, store } from '@/src/store';
import { UIProvider } from '@/src/utils/ui-provider';
import { hasConfig } from '@/src/workspace/config/loadConfig';

function WorkspaceGuard() {
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  
  // Get auth state from Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Small delay to ensure navigation is ready and persisted state is loaded
    const timer = setTimeout(async () => {
      // Check if workspace config exists (this is the critical check)
      const configExists = await hasConfig();
      
      // Determine if we're on an auth page
      const isOnAuthPage = pathname.includes('/(auth)/');
      const isOnOnboarding = pathname.includes('/(auth)/onboarding');
      
      // Rule: No config → onboarding required
      if (!configExists && !isOnOnboarding) {
        console.log('[WorkspaceGuard] No config found, redirecting to onboarding');
        import('expo-router').then(({ router }) => {
          router.replace('/(auth)/onboarding');
          hasRedirected.current = true;
        });
        return;
      }

      // Rule: Config exists → app allowed to load
      if (configExists && isOnOnboarding) {
        console.log('[WorkspaceGuard] Config exists, redirecting to dashboard');
        import('expo-router').then(({ router }) => {
          router.replace('/(app)/dashboard');
          hasRedirected.current = true;
        });
        return;
      }

      // Auth guard logic
      if (!isAuthenticated && !isOnAuthPage) {
        import('expo-router').then(({ router }) => {
          router.replace('/(auth)/login');
          hasRedirected.current = true;
        });
      }
      // If authenticated and on login page, redirect to dashboard (only if config exists)
      else if (isAuthenticated && pathname.includes('/(auth)/login') && configExists) {
        import('expo-router').then(({ router }) => {
          router.replace('/(app)/dashboard');
          hasRedirected.current = true;
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, isAuthenticated, activeWorkspace]);

  return null;
}

function HydrateWorkspace() {
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const workspaceConfig = useSelector((state: RootState) => state.auth.workspaces[activeWorkspace]);

  // Effect to sync Redux with config when workspace changes
  useEffect(() => {
    if (!activeWorkspace) return;
    
    // Log when workspace config changes
    console.log('[HydrateWorkspace] Active workspace:', activeWorkspace);
  }, [activeWorkspace]);

  return null;
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <UIProvider>
          <WorkspaceGuard />
          <HydrateWorkspace />
          <Slot />
        </UIProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

