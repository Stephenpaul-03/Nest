import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Box, Heading, Text, VStack } from '@gluestack-ui/themed';

export default function Settings() {
  return (
    <Box flex={1} bg="$backgroundLight0" padding="$6">
      <VStack gap="$6">
        <Heading size="xl" color="$textLight900">
          Settings
        </Heading>

        <Box>
          <Text size="lg" color="$textLight900" fontWeight="$bold" marginBottom="$4">
            Appearance
          </Text>
          <ThemeToggle />
        </Box>

        <Box>
          <Text size="lg" color="$textLight900" fontWeight="$bold" marginBottom="$4">
            About
          </Text>
          <Box
            padding="$4"
            bg="$backgroundLight0"
            borderWidth={1}
            borderColor="$outline200"
            borderRadius="$lg"
          >
            <Text size="md" color="$textLight900">
              Nest App v1.0.0
            </Text>
            <Text size="sm" color="$textLight600" marginTop="$1">
              A modern application built with Expo Router and Gluestack UI
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}

