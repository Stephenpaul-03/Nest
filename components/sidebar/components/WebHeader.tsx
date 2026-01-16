import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable } from '@gluestack-ui/themed';

export function WebHeader({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  return (
    <Box
      borderBottomWidth={1}
      borderBottomColor="$borderDark800"
      alignItems="center"
    >
      <Pressable onPress={toggle} p="$4" borderRadius="$xl" $hover={{ bg: '$backgroundDark800' }}>
        <MaterialIcons
          name={collapsed ? "chevron-right" : "chevron-left"}
          size={18}
          color="#a0a0a0"
        />
      </Pressable>
    </Box>
  );
}
