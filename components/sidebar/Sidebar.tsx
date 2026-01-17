import { useThemeContext } from '@/src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { CollapsedSubmenu } from './components/CollapsedSubmenu';
import { MobileHeader } from './components/MobileHeader';
import { NavItem } from './components/NavItem';
import { WebHeader } from './components/WebHeader';
import { useSidebarState } from './hooks/useSidebarState';
import { navigationItems } from './navigation';

export function Sidebar() {
  const router = useRouter();
  const state = useSidebarState();
  const { colorMode } = useThemeContext();

  const navigate = (path: string) => router.push(path as any);

  const isActive = (path: string) =>
    state.pathname === path || state.pathname.startsWith(path + '/');

  const sidebarWidth = state.isMobile
    ? '75%'
    : state.isSidebarCollapsed ? 72 : 250;

  const backgroundColor = colorMode === 'dark' ? '#0a0a0a' : '#FFFFFF';
  const borderColor = colorMode === 'dark' ? '$borderDark800' : '$borderLight200';
  const iconColor = colorMode === 'dark' ? '#D1D5DB' : '#374151';

  return (
    <>
      {state.isMobile && (
        <Box position="absolute" top={12} left={16} zIndex={10}>
          <Pressable onPress={() => state.setIsMobileDrawerOpen(!state.isMobileDrawerOpen)}>
            <MaterialIcons name="menu" size={24} color={iconColor} />
          </Pressable>
        </Box>
      )}

      <Box
        bg={backgroundColor}
        width={sidebarWidth}
        height="100%"
        borderRightWidth={state.isMobile ? 0 : 1}
        borderRightColor={borderColor}
      >
        {state.isMobile ? (
          <MobileHeader open={state.isMobileDrawerOpen} toggle={() => state.setIsMobileDrawerOpen(!state.isMobileDrawerOpen)} />
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
            {navigationItems
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
            {navigationItems
              .filter(i => i.title === 'Settings')
              .map((item, i) => (
                <NavItem
                  key={item.title}
                  item={item}
                  index={navigationItems.length - 1}
                  state={state}
                  isActive={isActive}
                  navigate={navigate}
                />
              ))}
          </VStack>
        </VStack>

      </Box>

      <CollapsedSubmenu
        index={state.collapsedSubmenuIndex}
        isActive={isActive}
        navigate={navigate}
        close={state.closeCollapsedMenu}
      />
    </>
  );
}

