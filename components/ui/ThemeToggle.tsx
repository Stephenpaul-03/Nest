import { useThemedColors } from '@/constants/colors';
import { useThemeContext } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { HStack, Switch, Text } from '@gluestack-ui/themed';
import React from 'react';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useThemeContext();
  const { isDark, background, text, toggle } = useThemedColors();

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      bg={background.cardAlt}
      borderWidth={1}
      borderColor={toggle.off}
      borderRadius="$lg"
    >
      <HStack alignItems="center" gap="$3">
        {isDark ? (
          <Ionicons name="moon" size={20} color={toggle.on} />
        ) : (
          <Ionicons name="sunny" size={20} color="#F59E0B" />
        )}
        <Text size="md" color={text.primary} fontWeight="$medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </HStack>
      <Switch
        value={isDark}
        onToggle={toggleColorMode}
        size="md"
        trackColor={{ false: toggle.off, true: toggle.on }}
        thumbColor="#FFFFFF"
      />
    </HStack>
  );
}

