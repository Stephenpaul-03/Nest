import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';

export function MobileHeader({ open, toggle }: { open: boolean; toggle: () => void }) {
  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      px="$4"
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderDark800"
    >
      <Pressable onPress={toggle}>
        <MaterialIcons name={open ? "close" : "menu"} size={24} color="#fff" />
      </Pressable>

      <Text color="$textLight50" fontWeight="$bold" fontSize="$lg">
        Menu
      </Text>

      <Box width={24} />
    </HStack>
  );
}
