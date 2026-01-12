import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { navigationItems } from '../navigation';

export function CollapsedSubmenu({ index, isActive, navigate, close }: any) {
  if (index === null) return null;
  const item = navigationItems[index];
  if (!item?.children) return null;

  return (
    <Box position="absolute" left={72} top={0} bottom={0} width={200} bg="$backgroundDark900" py="$4" zIndex={10}>
      <VStack space="xs" px="$3">
        <Text color="$textLight50" fontWeight="$bold" mb="$3">
          {item.title}
        </Text>

        {item.children.map(child => (
          <Pressable
            key={child.path}
            onPress={() => {
              navigate(child.path);
              close();
            }}
            py="$2"
            px="$2"
            borderRadius="$md"
            bg={isActive(child.path) ? '$primary500' : 'transparent'}
          >
            <HStack alignItems="center">
              <MaterialIcons name={child.icon} size={16} color="#a0a0a0" />
              <Text ml="$3">{child.title}</Text>
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </Box>
  );
}
