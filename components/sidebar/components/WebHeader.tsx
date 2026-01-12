import { MaterialIcons } from '@expo/vector-icons';
import { Box, Pressable } from '@gluestack-ui/themed';

export function WebHeader({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  return (
    <Box
      px={collapsed ? "$2" : "$4"}
      py="$3"
      mb="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderDark800"
      alignItems="center"
    >
      <Pressable onPress={toggle} p="$2" borderRadius="$md" $hover={{ bg: '$backgroundDark800' }}>
        <MaterialIcons
          name={collapsed ? "chevron-right" : "chevron-left"}
          size={20}
          color="#a0a0a0"
        />
      </Pressable>
    </Box>
  );
}
