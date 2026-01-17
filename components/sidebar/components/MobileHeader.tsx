import { useThemedColors } from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';

export function MobileHeader({ open, toggle }: { open: boolean; toggle: () => void }) {
  const { background, border, text, icon } = useThemedColors();

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      px="$4"
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor={border.primary}
      bg={background.primary}
    >
      <Pressable onPress={toggle}>
        <MaterialIcons name={open ? "close" : "menu"} size={24} color={icon.primary} />
      </Pressable>

      <Text color={text.primary} fontWeight="$bold" fontSize="$lg">
        Menu
      </Text>

      <Box width={24} />
    </HStack>
  );
}

