import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { CollapsedSubmenu } from './components/CollapsedSubmenu';
import { MobileHeader } from './components/MobileHeader';
import { NavItem } from './components/NavItem';
import { WebHeader } from './components/WebHeader';
import { useSidebarState } from './hooks/useSidebarState';
import { navigationItems } from './navigation';

export function Sidebar() {
  const router = useRouter();
  const state = useSidebarState();
  
  // Get active workspace and its enabled tools from Redux
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const workspaces = useSelector((state: RootState) => state.auth.workspaces);
  const enabledTools = workspaces[activeWorkspace]?.enabledTools || {
    finance: true,
    events: true,
    medicals: true,
  };

  // Use centralized theme colors
  const { background, border, icon } = useThemedColors();

  const navigate = (path: string) => router.push(path as any);

  const isActive = (path: string) =>
    state.pathname === path || state.pathname.startsWith(path + '/');

  // Calculate sidebar width based on state and device type
  let sidebarWidth: string | number;
  if (state.isMobile) {
    // On mobile, sidebar acts as a drawer
    sidebarWidth = '85%';
  } else if (state.isSidebarCollapsed) {
    sidebarWidth = 72; // Collapsed width
  } else {
    sidebarWidth = 250; // Expanded width
  }

  // Filter navigation items based on enabled tools for the current workspace
  const filteredNavigationItems = navigationItems.filter((item) => {
    if (item.toolKey) {
      return enabledTools[item.toolKey as keyof typeof enabledTools] === true;
    }
    return true;
  });

  // Render sidebar content
  const renderSidebarContent = () => (
    <>
      {state.isMobile ? (
        <MobileHeader 
          open={state.isMobileDrawerOpen} 
          toggle={() => state.setIsMobileDrawerOpen(!state.isMobileDrawerOpen)} 
        />
      ) : (
        <WebHeader 
          collapsed={state.isSidebarCollapsed} 
          toggle={() => {
            state.setIsSidebarCollapsed(!state.isSidebarCollapsed);
            if (state.isSidebarCollapsed) {
              state.closeCollapsedMenu();
            }
          }} 
        />
      )}

      <VStack
        flex={1}
        px="$2"
        pb="$2"
        justifyContent="space-between"
      >
        <VStack>
          {filteredNavigationItems
            .filter(i => i.title !== 'Settings')
            .map((item, i) => (
              <NavItem
                key={item.title}
                item={item}
                index={i}
                state={state}
                isActive={isActive}
                navigate={navigate}
              />
            ))}
        </VStack>

        <VStack>
          {filteredNavigationItems
            .filter(i => i.title === 'Settings')
            .map((item, i) => (
              <NavItem
                key={item.title}
                item={item}
                index={filteredNavigationItems.length - 1}
                state={state}
                isActive={isActive}
                navigate={navigate}
              />
            ))}
        </VStack>
      </VStack>
    </>
  );

  return (
    <>
      {/* Mobile menu button - only shows on mobile when drawer is closed */}
      {state.isMobile && !state.isMobileDrawerOpen && (
        <Box position="absolute" top={12} left={4} zIndex={10}>
          <Pressable 
            onPress={() => state.setIsMobileDrawerOpen(true)}
            p="$2"
            borderRadius="$md"
            $hover={{ bg: background.hover }}
          >
            <MaterialIcons name="menu" size={26} color={icon.primary} />
          </Pressable>
        </Box>
      )}

      {/* Sidebar container */}
      <Box
        bg={background.primary}
        width={sidebarWidth}
        height="100%"
        borderRightWidth={state.isMobile ? 0 : 1}
        borderRightColor={border.primary}
        position={state.isMobile ? 'absolute' : 'relative'}
        left={state.isMobile && state.isMobileDrawerOpen ? 0 : state.isMobile ? '-100%' : 0}
        zIndex={state.isMobile ? 100 : 1}
        shadow={state.isMobile ? 4 : 0}
      >
        {renderSidebarContent()}
      </Box>

      {/* Overlay when mobile drawer is open */}
      {state.isMobile && state.isMobileDrawerOpen && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
          zIndex={50}
          onTouchEnd={() => state.setIsMobileDrawerOpen(false)}
        />
      )}

      <CollapsedSubmenu
        index={state.collapsedSubmenuIndex}
        isActive={isActive}
        navigate={navigate}
        close={state.closeCollapsedMenu}
      />
    </>
  );
}

