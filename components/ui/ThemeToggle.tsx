import { useThemeContext } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { HStack, Switch, Text } from '@gluestack-ui/themed';
import React from 'react';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useThemeContext();

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      bg="$backgroundLight0"
      borderWidth={1}
      borderColor="$outline200"
      borderRadius="$lg"
    >
      <HStack alignItems="center" gap="$3">
        {colorMode === 'light' ? (
          <Ionicons name="sunny" size={20} color="#F59E0B" />
        ) : (
          <Ionicons name="moon" size={20} color="#6366F1" />
        )}
        <Text size="md" color="$textLight900" fontWeight="$medium">
          {colorMode === 'light' ? 'Light Mode' : 'Dark Mode'}
        </Text>
      </HStack>
      <Switch
        value={colorMode === 'dark'}
        onToggle={toggleColorMode}
        size="md"
        trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
        thumbColor="#FFFFFF"
      />
    </HStack>
  );
}

