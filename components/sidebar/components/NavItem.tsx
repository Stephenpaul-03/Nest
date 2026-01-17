import { useThemeContext } from '@/src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { NavItem as NavItemType } from '../types';

type Props = {
  item: NavItemType;
  index: number;
  state: any;
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
};

const IconBox = ({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) => (
  <Box
    width={compact ? 30 : 40}
    height={30}
    alignItems="center"
    justifyContent="center"
  >
    {children}
  </Box>
);


export function NavItem({ item, index, state, isActive, navigate }: Props) {
  const { colorMode } = useThemeContext();

  const isExpanded = state.expandedSections[index] || false;
  const hasChildren = !!item.children;
  const showLabel = !state.isSidebarCollapsed || state.isMobile;
  const isSubmenuOpen = state.collapsedSubmenuIndex === index;
  const accentColor = item.accentColor || '#3b82f6';
  const defaultColor = colorMode === 'dark' ? '#e5e7eb' : '#525252';
  const mutedColor = colorMode === 'dark' ? '#a0a0a0' : '#9ca3af';
  const hoverBg = colorMode === 'dark' ? '$backgroundDark800' : '$backgroundLight200';
  const borderColor = colorMode === 'dark' ? '$borderDark800' : '$borderLight200';
  const activeChild = hasChildren && item.children
    ? item.children.find(c => isActive(c.path))
    : null;
  const isParentActive = hasChildren && (
    isActive(item.path!) ||
    (item.children && item.children.some(c => isActive(c.path)))
  );

  const hasActiveChild = hasChildren && item.children && item.children.some(c => isActive(c.path));
  const textColor = colorMode === 'dark' ? '$textLight200' : '$textLight700';

  if (hasChildren) {
    return (
      <Box>
        <Pressable
          onPress={() => {
            if (state.isMobile) state.toggleSection(index);
            else if (state.isSidebarCollapsed)
              state.setCollapsedSubmenuIndex(isSubmenuOpen ? null : index);
            else state.toggleSection(index);
          }}
          py="$2"
          px={state.isSidebarCollapsed ? "$1" : "$3"}
          borderRadius="$md"
          alignItems="center"
          justifyContent={state.isSidebarCollapsed ? 'center' : 'flex-start'}
          $hover={{ bg: hoverBg }}
        >
          <HStack
            alignItems="center"
            width={state.isSidebarCollapsed ? 40 : "100%"}
            justifyContent="center"
          >
            <Box position="relative">
              <IconBox>
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={isParentActive || isSubmenuOpen ? accentColor : defaultColor}
                />
              </IconBox>

              {activeChild && (
                <Box
                  position="absolute"
                  top={-3}
                  right={3}
                  width={20}
                  height={20}
                  borderRadius={10}
                  bg="$backgroundDark900"
                  borderWidth={1}
                  borderColor={activeChild.accentColor || accentColor}
                  alignItems="center"
                  justifyContent="center"
                >
                  <MaterialIcons
                    name={activeChild.icon}
                    size={10}
                    color={activeChild.accentColor || accentColor}
                  />
                </Box>
              )}
            </Box>

            {showLabel && (
              <>
                <Text ml="$3" flex={1} color={hasActiveChild || isParentActive || isSubmenuOpen ? accentColor : textColor} fontWeight="$semibold">
                  {item.title}
                </Text>

                {!state.isSidebarCollapsed && (
                  <MaterialIcons
                    name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                    size={20}
                    color={mutedColor}
                  />
                )}
              </>
            )}
          </HStack>
        </Pressable>

        {isExpanded && !state.isSidebarCollapsed && (
          <VStack ml="$8" borderLeftWidth='$1' borderColor={borderColor}>
            {item.children!.map(child => {
              const childAccentColor = child.accentColor || accentColor;
              const isChildActive = isActive(child.path);

              return (
                <Pressable
                  key={child.path}
                  onPress={() => navigate(child.path)}
                  p="$1"
                  ml="$2"
                  borderRadius="$md"
                  $hover={{ bg: hoverBg }}
                >
                  <HStack alignItems="center">
                    <IconBox>
                      <MaterialIcons
                        name={child.icon}
                        size={16}
                        color={isChildActive ? childAccentColor : mutedColor}
                      />
                    </IconBox>

                    <Text ml="$3" color={isChildActive ? childAccentColor : mutedColor}>
                      {child.title}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )
        }
      </Box >
    );
  }

  const itemAccentColor = item.accentColor || accentColor;
  const isItemActive = isActive(item.path!);

  return (
    <Pressable
      onPress={() => navigate(item.path!)}
      py="$2"
      px={state.isSidebarCollapsed ? "$1" : "$3"}
      borderRadius="$md"
      alignItems={state.isSidebarCollapsed ? "center" : "flex-start"}
      justifyContent={state.isSidebarCollapsed ? 'center' : 'flex-start'}
      $hover={{ bg: hoverBg }}
    >
      <HStack alignItems="center">
        <IconBox>
          <MaterialIcons
            name={item.icon}
            size={22}
            color={isItemActive ? itemAccentColor : defaultColor}
          />
        </IconBox>

        {showLabel && (
          <Text ml="$3" color={isItemActive ? itemAccentColor : textColor} fontWeight="$semibold">
            {item.title}
          </Text>
        )}
      </HStack>
    </Pressable>
  );
}

