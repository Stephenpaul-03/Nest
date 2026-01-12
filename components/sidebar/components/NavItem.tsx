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

  const activeChild =
    state.isSidebarCollapsed && !state.isMobile && item.children
      ? item.children.find(c => isActive(c.path))
      : null;

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
          $hover={{ bg: '$backgroundDark800' }}
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
                  color={isSubmenuOpen ? "#3b82f6" : "#e5e7eb"}
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
                  alignItems="center"
                  justifyContent="center"
                >
                  <MaterialIcons
                    name={activeChild.icon}
                    size={11}
                    color="#3b82f6"
                  />
                </Box>
              )}
            </Box>

            {showLabel && (
              <>
                <Text ml="$3" flex={1} color="$textLight200" fontWeight="$semibold">
                  {item.title}
                </Text>

                {!state.isSidebarCollapsed && (
                  <MaterialIcons
                    name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                    size={20}
                    color="#a0a0a0"
                  />
                )}
              </>
            )}
          </HStack>
        </Pressable>

        {isExpanded && !state.isSidebarCollapsed && (
          <VStack ml="$6" mt="$2">
            {item.children!.map(child => (
              <Pressable
                key={child.path}
                onPress={() => navigate(child.path)}
                py="$2"
                px="$3"
                borderRadius="$md"
                bg={isActive(child.path) ? '$primary500' : 'transparent'}
                $hover={{ bg: '$backgroundDark800' }}
              >
                <HStack alignItems="center">
                  <IconBox>
                    <MaterialIcons
                      name={child.icon}
                      size={16}
                      color={isActive(child.path) ? "#fff" : "#a0a0a0"}
                    />
                  </IconBox>

                  <Text ml="$3" color={isActive(child.path) ? "$textLight50" : "$textLight400"}>
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

  return (
    <Pressable
      onPress={() => navigate(item.path!)}
      py="$2"
      px={state.isSidebarCollapsed ? "$1" : "$3"}
      borderRadius="$md"
      alignItems="center"
      justifyContent={state.isSidebarCollapsed ? 'center' : 'flex-start'}
      bg={isActive(item.path!) ? '$primary500' : 'transparent'}
      $hover={{ bg: '$backgroundDark800' }}
    >
      <HStack alignItems="center">
        <IconBox>
          <MaterialIcons
            name={item.icon}
            size={22}
            color={isActive(item.path!) ? "#fff" : "#e5e7eb"}
          />
        </IconBox>

        {showLabel && (
          <Text ml="$3" color="$textLight200" fontWeight="$semibold">
            {item.title}
          </Text>
        )}
      </HStack>
    </Pressable>
  );
}
