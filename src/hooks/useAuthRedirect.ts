import { RootState } from '@/src/store';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useAuthRedirect() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !pathname.includes('/(auth)/login')) {
      router.replace('/(auth)/login');
    }
    // If authenticated and on login page, redirect to dashboard
    else if (isAuthenticated && pathname.includes('/(auth)/login')) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, pathname]);
}

