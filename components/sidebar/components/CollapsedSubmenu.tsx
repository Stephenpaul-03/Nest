import { useThemedColors } from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { navigationItems } from '../navigation';

export function CollapsedSubmenu({ index, isActive, navigate, close }: any) {
  const { background, border, text, icon } = useThemedColors();
  
  if (index === null) return null;
  const item = navigationItems[index];
  if (!item?.children) return null;

  const accentColor = item.accentColor || '#3b82f6';

  return (
    <Box 
      position="absolute" 
      left={72} 
      top={0} 
      bottom={0} 
      width={200} 
      bg={background.primary}  
      zIndex={10}
      borderRightWidth={1}
      borderRightColor={border.primary}
    >
      <VStack>
        <HStack p="$4" mb='$3' justifyContent='center' borderBottomColor={border.primary} borderBottomWidth={1} bg={background.primary}>
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
              $hover={{ bg: isChildActive ? childAccentColor : background.hover }}
            >
              <HStack alignItems="center">
                <MaterialIcons 
                  name={child.icon} 
                  size={16} 
                  color={isChildActive ? "#fff" : icon.muted} 
                />
                <Text 
                  ml="$3" 
                  color={isChildActive ? "$textLight50" : text.primary}
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

