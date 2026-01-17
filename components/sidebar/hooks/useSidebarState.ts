import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useSidebarState() {
  const pathname = usePathname();
  
  // Use Platform.OS for reliable mobile detection on Android
  // This ensures consistent behavior without window dimension flicker
  const isMobile = Platform.OS !== 'web';
  const isPhone = Platform.OS !== 'web';
  const isTablet = false; // Can be enhanced with dimensions if needed
  const isDesktop = Platform.OS === 'web';
  
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  // On mobile (Android), sidebar is always expanded but acts as drawer
  // On desktop, it can be collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [collapsedSubmenuIndex, setCollapsedSubmenuIndex] = useState<number | null>(null);

  useEffect(() => {
    // Close mobile drawer when navigating on mobile devices
    if (isMobile) setIsMobileDrawerOpen(false);
  }, [pathname, isMobile]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const closeCollapsedMenu = () => setCollapsedSubmenuIndex(null);

  return {
    pathname,
    isMobile,
    isPhone,
    isTablet,
    isDesktop,
    isAndroid,
    isIOS,
    isWeb,

    expandedSections,
    isSidebarCollapsed,
    isMobileDrawerOpen,
    collapsedSubmenuIndex,

    setIsSidebarCollapsed,
    setIsMobileDrawerOpen,
    setCollapsedSubmenuIndex,
    toggleSection,
    closeCollapsedMenu,
  };
}
