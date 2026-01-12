import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useSidebarState() {
  const pathname = usePathname();
  const isMobile = Platform.OS !== 'web';

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [collapsedSubmenuIndex, setCollapsedSubmenuIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isMobile) setIsMobileDrawerOpen(false);
  }, [pathname, isMobile]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const closeCollapsedMenu = () => setCollapsedSubmenuIndex(null);

  return {
    pathname,
    isMobile,

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
