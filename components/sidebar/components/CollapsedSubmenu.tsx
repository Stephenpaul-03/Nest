import { useThemeContext } from '@/src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { navigationItems } from '../navigation';

export function CollapsedSubmenu({ index, isActive, navigate, close }: any) {
  const { colorMode } = useThemeContext();
  
  if (index === null) return null;
  const item = navigationItems[index];
  if (!item?.children) return null;

  const accentColor = item.accentColor || '#3b82f6';
  const defaultColor = '#e5e7eb';
  const mutedColor = colorMode === 'dark' ? '#a0a0a0' : '#9ca3af';
  const backgroundColor = colorMode === 'dark' ? '#0a0a0a' : '#FFFFFF';
  const borderColor = colorMode === 'dark' ? '$borderDark800' : '$borderLight200';
  const hoverBg = colorMode === 'dark' ? '$backgroundDark800' : '$backgroundLight200';
  const headerBg = colorMode === 'dark' ? '$backgroundDark900' : '$backgroundLight0';
  const textColor = colorMode === 'dark' ? '$textLight200' : '$textLight700';
  const headerTextColor = colorMode === 'dark' ? '$textLight50' : '$textLight900';

  return (
    <Box 
      position="absolute" 
      left={72} 
      top={0} 
      bottom={0} 
      width={200} 
      bg={backgroundColor}  
      zIndex={10}
      borderRightWidth={1}
      borderRightColor={borderColor}
    >
      <VStack>
        <HStack p="$4" mb='$3' justifyContent='center' borderBottomColor={borderColor} borderBottomWidth={1} bg={backgroundColor}>
          <MaterialIcons name={item.icon} size={18} color={accentColor} />
          <Text ml="$2" color={accentColor} fontWeight="$bold">
            {item.title}
          </Text>
        </HStack>

        {item.children.map((child: any) => {
          const childAccentColor = child.accentColor || accentColor;
          const isChildActive = isActive(child.path);
          
          return (
            <Pressable
              key={child.path}
              onPress={() => {
                navigate(child.path);
                close();
              }}
              p="$2"
              mx="$4"
              borderRadius="$md"
              bg={isChildActive ? childAccentColor : 'transparent'}
              $hover={{ bg: isChildActive ? childAccentColor : hoverBg }}
            >
              <HStack alignItems="center">
                <MaterialIcons 
                  name={child.icon} 
                  size={16} 
                  color={isChildActive ? "#fff" : mutedColor} 
                />
                <Text 
                  ml="$3" 
                  color={isChildActive ? "$textLight50" : textColor}
                  fontWeight={isChildActive ? "$semibold" : "$normal"}
                >
                  {child.title}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </VStack>
    </Box>
  );
}

