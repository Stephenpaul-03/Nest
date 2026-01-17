import { useThemeContext } from '@/src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Pressable, Text } from '@gluestack-ui/themed';

export function MobileHeader({ open, toggle }: { open: boolean; toggle: () => void }) {
  const { colorMode } = useThemeContext();
  
  const backgroundColor = colorMode === 'dark' ? '$backgroundDark900' : '$backgroundLight0';
  const borderColor = colorMode === 'dark' ? '$borderDark800' : '$borderLight200';
  const iconColor = colorMode === 'dark' ? '#fff' : '#11181C';
  const textColor = colorMode === 'dark' ? '$textLight50' : '$textLight900';

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      px="$4"
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor={borderColor}
      bg={backgroundColor}
    >
      <Pressable onPress={toggle}>
        <MaterialIcons name={open ? "close" : "menu"} size={24} color={iconColor} />
      </Pressable>

      <Text color={textColor} fontWeight="$bold" fontSize="$lg">
        Menu
      </Text>

      <Box width={24} />
    </HStack>
  );
}

