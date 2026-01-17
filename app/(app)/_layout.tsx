import { Sidebar } from '@/components/sidebar/Sidebar';
import { useThemedColors } from '@/constants/colors';
import { Box, HStack } from '@gluestack-ui/themed';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function AppLayoutContent() {
  const { background } = useThemedColors();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: background.primary }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <HStack flex={1} bg={background.primary}>
        <Sidebar />
        <Box flex={1} bg={background.primary}>
          <Slot />
        </Box>
      </HStack>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <AppLayoutContent />
    </SafeAreaProvider>
  );
}
