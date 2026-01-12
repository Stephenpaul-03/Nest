import { Sidebar } from '@/components/sidebar/Sidebar';
import { Box, HStack } from '@gluestack-ui/themed';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['top', 'bottom', 'left', 'right']}>
        <HStack flex={1} bg="$backgroundDark900">
          {/* Sidebar - visible on all platforms */}
          <Sidebar />
          
          {/* Main content area */}
          <Box flex={1} bg="$backgroundDark900">
            <Slot />
          </Box>
        </HStack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

