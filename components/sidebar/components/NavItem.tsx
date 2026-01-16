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
  const isExpanded = state.expandedSections[index] || false;
  const hasChildren = !!item.children;
  const showLabel = !state.isSidebarCollapsed || state.isMobile;
  const isSubmenuOpen = state.collapsedSubmenuIndex === index;
  const accentColor = item.accentColor || '#3b82f6';
  const defaultColor = '#e5e7eb';
  const mutedColor = '#a0a0a0';
  const activeChild = hasChildren && item.children
    ? item.children.find(c => isActive(c.path))
    : null;
  const isParentActive = hasChildren && (
    isActive(item.path!) || 
    (item.children && item.children.some(c => isActive(c.path)))
  );
  
  const hasActiveChild = hasChildren && item.children && item.children.some(c => isActive(c.path));

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
          // bg={!state.isSidebarCollapsed && hasActiveChild ? accentColor : 'transparent'}
          // $hover={{ bg: !state.isSidebarCollapsed && hasActiveChild ? accentColor : '$backgroundDark800' }}
          $hover={{bg:"$backgroundDark800"}}
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
                  top={-2}
                  right={-2}
                  width={18}
                  height={18}
                  borderRadius={9}
                  bg="$backgroundDark900"
                  borderWidth={1}
                  borderColor={activeChild.accentColor || accentColor}
                  alignItems="center"
                  justifyContent="center"
                >
                  <MaterialIcons
                    name={activeChild.icon}
                    size={11}
                    color={activeChild.accentColor || accentColor}
                  />
                </Box>
              )}
            </Box>

            {showLabel && (
              <>
                <Text ml="$3" flex={1} color={hasActiveChild || isParentActive || isSubmenuOpen ? accentColor : "$textLight200"} fontWeight="$semibold">
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
          <VStack ml="$6" mt="$2">
            {item.children!.map(child => {
              const childAccentColor = child.accentColor || accentColor;
              const isChildActive = isActive(child.path);
              
              return (
                <Pressable
                  key={child.path}
                  onPress={() => navigate(child.path)}
                  py="$2"
                  px="$3"
                  borderRadius="$md"
                  bg={isChildActive ? childAccentColor : 'transparent'}
                  $hover={{ bg: isChildActive ? childAccentColor : '$backgroundDark800' }}
                >
                  <HStack alignItems="center">
                    <IconBox>
                      <MaterialIcons
                        name={child.icon}
                        size={16}
                        color={isChildActive ? "#fff" : mutedColor}
                      />
                    </IconBox>

                    <Text ml="$3" color={isChildActive ? "$textLight50" : "$textLight400"}>
                      {child.title}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}
      </Box>
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
      bg={!state.isSidebarCollapsed && isItemActive ? itemAccentColor : 'transparent'}
      $hover={{ bg: !state.isSidebarCollapsed && isItemActive ? itemAccentColor : '$backgroundDark800' }}
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
          <Text ml="$3" color={isItemActive ? itemAccentColor : "$textLight200"} fontWeight="$semibold">
            {item.title}
          </Text>
        )}
      </HStack>
    </Pressable>
  );
}

