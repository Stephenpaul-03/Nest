import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { navigationItems } from '../navigation';

export function CollapsedSubmenu({ index, isActive, navigate, close }: any) {
  if (index === null) return null;
  const item = navigationItems[index];
  if (!item?.children) return null;

  const accentColor = item.accentColor || '#3b82f6';
  const defaultColor = '#e5e7eb';
  const mutedColor = '#a0a0a0';

  return (
    <Box 
      position="absolute" 
      left={72} 
      top={0} 
      bottom={0} 
      width={200} 
      bg="$backgroundDark900"  
      zIndex={10}
      borderRightWidth={1}
      borderRightColor='$borderDark800'
    >
      <VStack space="md">
        <HStack py='$4' px="$3" justifyContent='center' borderBottomColor='$borderDark800' borderBottomWidth={1}>
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
              py="$2"
              mx='$2'
              mt="$1"
              px="$2"
              borderRadius="$md"
              bg={isChildActive ? childAccentColor : 'transparent'}
              $hover={{ bg: isChildActive ? childAccentColor : '$backgroundDark800' }}
            >
              <HStack alignItems="center">
                <MaterialIcons 
                  name={child.icon} 
                  size={16} 
                  color={isChildActive ? "#fff" : mutedColor} 
                />
                <Text 
                  ml="$3" 
                  color={isChildActive ? "$textLight50" : "$textLight300"}
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

