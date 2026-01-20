/**
 * Alert Card Component
 * Displays inventory alerts with visual indicators
 */
import { useThemedColors } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed';
import React from 'react';

interface AlertCardProps {
  title: string;
  count: number;
  alertType: 'warning' | 'error' | 'info';
  icon: string;
  description?: string;
}

export function AlertCard({ title, count, alertType, icon, description }: AlertCardProps) {
  const colors = useThemedColors();
  const alertColors = {
    warning: {
      bg: colors.isDark ? '#451a03' : '#fffbeb',
      border: colors.isDark ? '#78350f' : '#fcd34d',
      icon: colors.isDark ? '#f59e0b' : '#d97706',
      text: colors.isDark ? '#fbbf24' : '#92400e',
    },
    error: {
      bg: colors.isDark ? '#450a0a' : '#fef2f2',
      border: colors.isDark ? '#dc2626' : '#fca5a5',
      icon: colors.isDark ? '#ef4444' : '#dc2626',
      text: colors.isDark ? '#f87171' : '#b91c1c',
    },
    info: {
      bg: colors.isDark ? '#0c4a6e' : '#eff6ff',
      border: colors.isDark ? '#0369a1' : '#93c5fd',
      icon: colors.isDark ? '#38bdf8' : '#0284c7',
      text: colors.isDark ? '#7dd3fc' : '#0369a1',
    },
  };
  const colorScheme = alertColors[alertType];
  if (count === 0) return null;
  return (
    <Box bg={colorScheme.bg} borderWidth={1} borderColor={colorScheme.border} borderRadius="$lg" p="$3">
      <HStack gap="$3" alignItems="center">
        <Box bg={colorScheme.bg} p="$2" borderRadius="$md" justifyContent="center" alignItems="center">
          <MaterialCommunityIcons name={icon as any} size={20} color={colorScheme.icon} />
        </Box>
        <VStack flex={1}>
          <Text size="lg" fontWeight="$bold" color={colorScheme.text}>{count}</Text>
          <Text size="xs" color={colorScheme.text} opacity={0.8}>{title}</Text>
          {description && <Text size="xs" color={colorScheme.text} opacity={0.6}>{description}</Text>}
        </VStack>
      </HStack>
    </Box>
  );
}
export function LowStockAlertCard({ count }: { count: number }) {
  return <AlertCard title="Low Stock" count={count} alertType="warning" icon="alert-circle-outline" description="Items below threshold" />;
}
export function OutOfStockAlertCard({ count }: { count: number }) {
  return <AlertCard title="Out of Stock" count={count} alertType="error" icon="package-variant-remove" description="Need restocking" />;
}
export function ExpiringSoonAlertCard({ count }: { count: number }) {
  return <AlertCard title="Expiring Soon" count={count} alertType="warning" icon="clock-alert-outline" description="Within 30 days" />;
}
export function ExpiredAlertCard({ count }: { count: number }) {
  return <AlertCard title="Expired" count={count} alertType="error" icon="clock-remove-outline" description="Past expiry date" />;
}
