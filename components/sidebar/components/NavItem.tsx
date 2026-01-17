import { useThemedColors } from '@/constants/colors';
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
  const { background, border, text, icon } = useThemedColors();

  const isExpanded = state.expandedSections[index] || false;
  const hasChildren = !!item.children;
  const showLabel = !state.isSidebarCollapsed || state.isMobile;
  const isSubmenuOpen = state.collapsedSubmenuIndex === index;
  const accentColor = item.accentColor || '#3b82f6';
  
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
          $hover={{ bg: background.hover }}
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
                  color={isParentActive || isSubmenuOpen ? accentColor : icon.primary}
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
                  bg={background.tertiary}
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
                <Text ml="$3" flex={1} color={hasActiveChild || isParentActive || isSubmenuOpen ? accentColor : text.primary} fontWeight="$semibold">
                  {item.title}
                </Text>

                {!state.isSidebarCollapsed && (
                  <MaterialIcons
                    name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                    size={20}
                    color={icon.muted}
                  />
                )}
              </>
            )}
          </HStack>
        </Pressable>

        {isExpanded && !state.isSidebarCollapsed && (
          <VStack ml="$8" borderLeftWidth='$1' borderColor={border.primary}>
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
                  $hover={{ bg: background.hover }}
                >
                  <HStack alignItems="center">
                    <IconBox>
                      <MaterialIcons
                        name={child.icon}
                        size={16}
                        color={isChildActive ? childAccentColor : icon.muted}
                      />
                    </IconBox>

                    <Text ml="$3" color={isChildActive ? childAccentColor : icon.muted}>
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
      $hover={{ bg: background.hover }}
    >
      <HStack alignItems="center">
        <IconBox>
          <MaterialIcons
            name={item.icon}
            size={22}
            color={isItemActive ? itemAccentColor : icon.primary}
          />
        </IconBox>

        {showLabel && (
          <Text ml="$3" color={isItemActive ? itemAccentColor : text.primary} fontWeight="$semibold">
            {item.title}
          </Text>
        )}
      </HStack>
    </Pressable>
  );
}

