import { Sidebar } from '@/components/sidebar/Sidebar';
import { useThemeContext } from '@/src/context/ThemeContext';
import { Box, HStack } from '@gluestack-ui/themed';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function AppLayoutContent() {
  const { colorMode } = useThemeContext();
  const backgroundColor = colorMode === 'dark' ? '#0a0a0a' : '#FBFBFB';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <HStack flex={1} bg={backgroundColor}>
        {/* Sidebar - visible on all platforms */}
        <Sidebar />

        {/* Main content area */}
        <Box flex={1} bg={backgroundColor}>
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

