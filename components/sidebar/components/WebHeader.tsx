import { useThemedColors } from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable } from '@gluestack-ui/themed';

export function WebHeader({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  const { background, border, icon } = useThemedColors();

  return (
    <Box
      borderBottomWidth={1}
      borderBottomColor={border.primary}
      alignItems="center"
      mb='$3'
      p="$2"
    >
      <Pressable onPress={toggle} p="$2" borderRadius="$lg" $hover={{ bg: background.hover }}>
        <MaterialIcons
          name={collapsed ? "chevron-right" : "chevron-left"}
          size={18}
          color={icon.muted}
        />
      </Pressable>
    </Box>
  );
}

