import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, TouchableWithoutFeedback, View } from 'react-native';

type NavItem = {
  title: string;
  path?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children?: { title: string; path: string; icon: keyof typeof MaterialIcons.glyphMap }[];
};

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Accounts',
    icon: 'account-balance-wallet',
    children: [
      { title: 'Overview', path: '/accounts/overview', icon: 'pie-chart' },
      { title: 'Personal', path: '/accounts/personal', icon: 'person' },
      { title: 'Family', path: '/accounts/family', icon: 'family-restroom' },
      { title: 'Tools', path: '/accounts/tools', icon: 'build' },
    ],
  },
  {
    title: 'Events',
    icon: 'event',
    children: [
      { title: 'Upcoming', path: '/events/upcoming', icon: 'upcoming' },
      { title: 'Calendar', path: '/events/calendar', icon: 'calendar-month' },
      { title: 'Tools', path: '/events/tools', icon: 'build' },
    ],
  },
  {
    title: 'Medbay',
    icon: 'local-hospital',
    children: [
      { title: 'Stocks', path: '/medbay/stocks', icon: 'inventory' },
      { title: 'Timetable', path: '/medbay/timetable', icon: 'schedule' },
      { title: 'Tools', path: '/medbay/tools', icon: 'build' },
    ],
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'settings',
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, // Accounts expanded by default
    2: true, // Events expanded by default
    3: true, // Medbay expanded by default
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [collapsedSubmenuIndex, setCollapsedSubmenuIndex] = useState<number | null>(null);
  const sidebarRef = useRef<View>(null);

  const isMobile = Platform.OS !== 'web';

  // Close mobile drawer when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileDrawerOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle clicking on a tool item in collapsed mode
  const handleCollapsedToolClick = (index: number, hasChildren: boolean) => {
    if (hasChildren) {
      // Toggle submenu for this tool
      if (collapsedSubmenuIndex === index) {
        setCollapsedSubmenuIndex(null);
      } else {
        setCollapsedSubmenuIndex(index);
      }
    } else {
      // Navigate directly for items without children
      const item = navigationItems[index];
      if (item.path) {
        router.push(item.path as any);
      }
      setCollapsedSubmenuIndex(null);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Web: collapsed width = 72px, expanded = 250px
  // Mobile: drawer width = '75%'
  const sidebarWidth = isMobile
    ? '75%'
    : (isSidebarCollapsed ? 72 : 250);

  // Mobile overlay to close drawer
  const MobileOverlay = () => {
    if (!isMobile || !isMobileDrawerOpen) return null;
    return (
      <Pressable
        flex={1}
        bg="rgba(0,0,0,0.5)"
        onPress={() => setIsMobileDrawerOpen(false)}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
      />
    );
  };

  // Close collapsed submenu when clicking outside
  const handleOverlayPress = () => {
    setCollapsedSubmenuIndex(null);
  };

  // Get the active child item for a parent (used for collapsed sidebar indicator)
  const getActiveChildForParent = (parentIndex: number): { icon: keyof typeof MaterialIcons.glyphMap; title: string } | null => {
    const item = navigationItems[parentIndex];
    if (!item.children) return null;

    // Find which child is currently active
    for (const child of item.children) {
      if (isActive(child.path)) {
        return { icon: child.icon, title: child.title };
      }
    }
    return null;
  };

  // Render collapsed submenu flyout
  const CollapsedSubmenu = () => {
    if (collapsedSubmenuIndex === null || isMobile) return null;

    const item = navigationItems[collapsedSubmenuIndex];
    if (!item.children) return null;

    return (
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Box
          position="absolute"
          left={72}
          top={0}
          bottom={0}
          width={200}
          bg="$backgroundDark900"
          borderRightWidth={1}
          borderRightColor="$borderDark800"
          py="$4"
          zIndex={10}
        >
          <VStack space="xs" px="$3">
            <Text
              color="$textLight50"
              fontWeight="$bold"
              fontSize="$md"
              mb="$3"
              px="$2"
            >
              {item.title}
            </Text>
            {item.children.map((child, childIndex) => (
              <Pressable
                key={childIndex}
                onPress={() => {
                  navigateTo(child.path);
                  setCollapsedSubmenuIndex(null);
                }}
                py="$2"
                px="$2"
                borderRadius="$md"
                bg={isActive(child.path) ? '$primary500' : 'transparent'}
                $hover={{ bg: isActive(child.path) ? '$primary500' : '$backgroundDark800' }}
              >
                <HStack alignItems="center">
                  <MaterialIcons
                    name={child.icon}
                    size={16}
                    color={isActive(child.path) ? "#ffffff" : "#a0a0a0"}
                  />
                  <Text
                    color={isActive(child.path) ? "$textLight50" : "$textLight400"}
                    fontSize="$sm"
                    ml="$3"
                  >
                    {child.title}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </TouchableWithoutFeedback>
    );
  };

  // Render nav item
  const renderNavItem = (item: NavItem, index: number) => {
    const isExpanded = expandedSections[index] || false;
    const itemActive = item.path ? isActive(item.path) : false;
    const hasChildren = !!item.children;

    // For collapsed sidebar on web, show icon only
    const showLabel = !isSidebarCollapsed || isMobile;

    // In collapsed mode, check if this item's submenu is open
    const isSubmenuOpen = collapsedSubmenuIndex === index;

    // Get active child icon for collapsed mode indicator
    const activeChild = isSidebarCollapsed && !isMobile ? getActiveChildForParent(index) : null;

    if (item.children) {
      return (
        <Box key={index}>
          {/* Section Header */}
          <Pressable
            onPress={() => {
              if (isMobile) {
                toggleSection(index);
              } else if (isSidebarCollapsed) {
                handleCollapsedToolClick(index, hasChildren);
              } else {
                toggleSection(index);
              }
            }}
            py="$2"
            px={isSidebarCollapsed ? "$1" : "$3"}
            borderRadius="$md"
            bg={isExpanded && !isMobile && !isSidebarCollapsed ? '$backgroundDark800' : 'transparent'}
            $hover={{ bg: '$backgroundDark800' }}
            alignItems="center"
            justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
          >
            <HStack
              alignItems="center"
              justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
              width="100%"
            >
              <Box position="relative">
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={isSubmenuOpen ? "#3b82f6" : (isExpanded ? "#e5e7eb" : "#a0a0a0")}
                />
                {/* Active subsection icon indicator (replaces blue dot) */}
                {activeChild && (
                  <Box
                    position="absolute"
                    top={-4}
                    right={-4}
                    width={20}
                    height={20}
                    borderRadius={10}
                    bg="$backgroundDark900"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor="$backgroundDark900"
                    zIndex={1}
                  >
                    <MaterialIcons
                      name={activeChild.icon}
                      size={12}
                      color="#3b82f6"
                    />
                  </Box>
                )}
              </Box>
              {showLabel && (
                <>
                  <Text
                    color="$textLight200"
                    fontWeight="$semibold"
                    fontSize="$md"
                    ml="$3"
                    flex={1}
                  >
                    {item.title}
                  </Text>
                  {!isSidebarCollapsed && (
                    <Box ml={2}>
                      <MaterialIcons
                        name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                        size={20}
                        color="#a0a0a0"
                      />
                    </Box>
                  )}
                </>
              )}
            </HStack>
          </Pressable>

          {/* Child Items (only when expanded and not collapsed) */}
          {isExpanded && !isSidebarCollapsed && (
            <VStack space="xs" ml="$6" mt="$2">
              {item.children.map((child, childIndex) => (
                <Pressable
                  key={childIndex}
                  onPress={() => navigateTo(child.path)}
                  py="$2"
                  px="$3"
                  borderRadius="$md"
                  bg={isActive(child.path) ? '$primary500' : 'transparent'}
                  $hover={{ bg: isActive(child.path) ? '$primary500' : '$backgroundDark800' }}
                >
                  <HStack alignItems="center">
                    <MaterialIcons
                      name={child.icon}
                      size={16}
                      color={isActive(child.path) ? "#ffffff" : "#a0a0a0"}
                    />
                    <Text
                      color={isActive(child.path) ? "$textLight50" : "$textLight400"}
                      fontSize="$sm"
                      ml="$3"
                    >
                      {child.title}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          )}
        </Box>
      );
    }

    // Simple nav item without children
    return (
      <Pressable
        key={index}
        onPress={() => {
          if (isSidebarCollapsed && !isMobile) {
            handleCollapsedToolClick(index, hasChildren);
          } else {
            navigateTo(item.path!);
          }
        }}
        py="$2"
        px={isSidebarCollapsed ? "$1" : "$3"}
        borderRadius="$md"
        bg={itemActive ? '$primary500' : 'transparent'}
        $hover={{ bg: itemActive ? '$primary500' : '$backgroundDark800' }}
        alignItems="center"
        justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
      >
        <MaterialIcons
          name={item.icon}
          size={24}
          color={itemActive ? "#ffffff" : "#e5e7eb"}
        />
        {showLabel && (
          <Text
            color={itemActive ? "$textLight50" : "$textLight200"}
            fontWeight="$semibold"
            fontSize="$md"
            ml="$3"
            flex={1}
          >
            {item.title}
          </Text>
        )}
      </Pressable>
    );
  };

  // Mobile header with hamburger
  const MobileHeader = () => (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      px="$4"
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderDark800"
    >
      <Pressable onPress={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}>
        <MaterialIcons name={isMobileDrawerOpen ? "close" : "menu"} size={24} color="#fff" />
      </Pressable>
      <Text color="$textLight50" fontWeight="$bold" fontSize="$lg">
        Menu
      </Text>
      <Box width={24} />
    </HStack>
  );

  // Web header with collapse toggle
  const WebHeader = () => (
    <Box
      px={isSidebarCollapsed ? "$2" : "$4"}
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderDark800"
      alignItems='center'
      justifyContent={isSidebarCollapsed ? 'center' : 'space-between'}
    >
      {(
        <Pressable
          onPress={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            setCollapsedSubmenuIndex(null);
          }}
          p="$2"
          borderRadius="$md"
          $hover={{ bg: '$backgroundDark800' }}
        >
          <MaterialIcons
            name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
            size={20}
            color="#a0a0a0"
          />
        </Pressable>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile: Hamburger icon in fixed header */}
      {isMobile && (
        <Box
          position="absolute"
          top={12}
          left={16}
          zIndex={10}
        >
          <Pressable
            onPress={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            p="$2"
          >
            <MaterialIcons name="menu" size={24} color="#fff" />
          </Pressable>
        </Box>
      )}

      {/* Sidebar */}
      <Box
        ref={sidebarRef as any}
        bg="$backgroundDark900"
        width={sidebarWidth}
        height="100%"
        borderRightWidth={isMobile ? 0 : 1}
        borderRightColor="$borderDark800"
        style={
          isMobile
            ? {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1,
              transform: [{ translateX: isMobileDrawerOpen ? 0 : -1000 }],
            }
            : {
              position: 'sticky',
              top: 0,
              height: '100%',
            }
        }
      >
        {isMobile ? <MobileHeader /> : <WebHeader />}

        <VStack
          space="xs"
          px={isSidebarCollapsed ? "$1" : "$4"}
        >
          {navigationItems.map((item, index) => renderNavItem(item, index))}
        </VStack>
      </Box>

      {/* Collapsed submenu flyout for web */}
      <CollapsedSubmenu />

      {/* Mobile overlay */}
      <MobileOverlay />
    </>
  );
}

