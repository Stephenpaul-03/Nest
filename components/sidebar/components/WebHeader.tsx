import { useThemeContext } from '@/src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable } from '@gluestack-ui/themed';

export function WebHeader({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  const { colorMode } = useThemeContext();
  
  const borderColor = colorMode === 'dark' ? '$borderDark800' : '$borderLight200';
  const iconColor = colorMode === 'dark' ? '#a0a0a0' : '#6b7280';
  const hoverBg = colorMode === 'dark' ? '$backgroundDark800' : '$backgroundLight200';

  return (
    <Box
      borderBottomWidth={1}
      borderBottomColor={borderColor}
      alignItems="center"
      mb='$3'
      p="$2"
    >
      <Pressable onPress={toggle} p="$2" borderRadius="$lg" $hover={{ bg: hoverBg }}>
        <MaterialIcons
          name={collapsed ? "chevron-right" : "chevron-left"}
          size={18}
          color={iconColor}
        />
      </Pressable>
    </Box>
  );
}

