/**
 * Inventory Item Row Component
 * Displays a single inventory item in the list with controls
 */

import { useThemedColors } from '@/constants/colors';
import { MedicalItem } from '@/src/types/inventory';
import {
  formatRelativeDate,
  getStockLevel,
  isExpired,
  isExpiringSoon,
  isLowStock
} from '@/src/utils/inventoryHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  HStack,
  Pressable,
  Text,
  VStack
} from '@gluestack-ui/themed';
import React from 'react';

interface InventoryItemRowProps {
  item: MedicalItem;
  onEdit: () => void;
  onDelete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function InventoryItemRow({
  item,
  onEdit,
  onDelete,
  onIncrement,
  onDecrement,
}: InventoryItemRowProps) {
  const colors = useThemedColors();

  const isItemExpired = isExpired(item);
  const isItemExpiringSoon = isExpiringSoon(item);
  const isItemLowStock = isLowStock(item);
  const stockLevel = getStockLevel(item);

  const getStatusBadge = () => {
    if (isItemExpired) {
      return {
        label: 'Expired',
        color: colors.isDark ? '#f87171' : '#dc2626',
        bg: colors.isDark ? '#450a0a' : '#fef2f2',
        icon: 'clock-remove-outline' as const,
      };
    }
    if (isItemExpiringSoon) {
      return {
        label: 'Expiring Soon',
        color: colors.isDark ? '#fbbf24' : '#d97706',
        bg: colors.isDark ? '#451a03' : '#fffbeb',
        icon: 'clock-alert-outline' as const,
      };
    }
    if (stockLevel === 'low') {
      return {
        label: 'Low Stock',
        color: colors.isDark ? '#fbbf24' : '#d97706',
        bg: colors.isDark ? '#451a03' : '#fffbeb',
        icon: 'alert-circle-outline' as const,
      };
    }
    if (stockLevel === 'critical') {
      return {
        label: 'Out of Stock',
        color: colors.isDark ? '#f87171' : '#dc2626',
        bg: colors.isDark ? '#450a0a' : '#fef2f2',
        icon: 'package-variant-remove' as const,
      };
    }
    return {
      label: item.type === 'medicine' ? 'Medicine' : 'Supply',
      color: colors.isDark ? '#94a3b8' : '#64748b',
      bg: colors.isDark ? '#1e293b' : '#f1f5f9',
      icon: item.type === 'medicine' ? 'pill' : 'package-variant',
    };
  };

  const statusBadge = getStatusBadge();

  // Stock level colors
  const stockColor = stockLevel === 'critical'
    ? (colors.isDark ? '#f87171' : '#dc2626')
    : stockLevel === 'low'
      ? (colors.isDark ? '#fbbf24' : '#d97706')
      : colors.text.primary;

  const borderColor = isItemExpired
    ? (colors.isDark ? '#dc2626' : '#fca5a5')
    : isItemExpiringSoon || stockLevel === 'low'
      ? (colors.isDark ? '#f59e0b' : '#fcd34d')
      : colors.border.primary;

  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={borderColor}
      p="$4"
      mb="$2"
      opacity={isItemExpired ? 0.7 : 1}
    >
      <HStack gap="$4" alignItems="flex-start">
        {/* Type Icon */}
        <Box
          bg={
            item.type === 'medicine'
              ? colors.isDark ? '#312e81' : '#eef2ff'
              : colors.isDark ? '#1e3a5f' : '#eff6ff'
          }
          p="$3"
          borderRadius="$lg"
          mt="$1"
        >
          <MaterialCommunityIcons
            name={item.type === 'medicine' ? 'pill' : 'package-variant'}
            size={24}
            color={
              item.type === 'medicine'
                ? colors.isDark ? '#818cf8' : '#4f46e5'
                : colors.isDark ? '#60a5fa' : '#2563eb'
            }
          />
        </Box>

        {/* Main Content */}
        <VStack flex={1} gap="$2">
          {/* Name and Actions */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} gap="$1">
              <HStack gap="$2" alignItems="center" flexWrap="wrap">
                <Text
                  size="lg"
                  fontWeight="$semibold"
                  color={colors.text.primary}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.assignedTo && (
                  <Box
                    bg={colors.background.secondary}
                    px="$2"
                    py="$1"
                    borderRadius="$md"
                  >
                    <Text size="xs" color={colors.text.muted}>
                      {item.assignedTo}
                    </Text>
                  </Box>
                )}
              </HStack>
              <HStack gap="$2" alignItems="center">
                <Text size="sm" color={colors.text.muted}>
                  {item.category}
                </Text>
                <Box w="$1" h="$1" borderRadius="$full" bg={colors.text.muted} />
                <Text size="sm" color={colors.text.muted}>
                  {item.type === 'medicine' ? 'Medicine' : 'Supply'}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Action Buttons */}
          <HStack gap="$1" ml="$2">
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              p="$2"
              borderRadius="$md"
              bg={colors.background.input}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={16}
                color={colors.text.secondary}
              />
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              p="$2"
              borderRadius="$md"
              bg={colors.background.input}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={16}
                color="#ef4444"
              />
            </Pressable>
          </HStack>

          {/* Status Badges Row */}
          <HStack gap="$2" alignItems="center" flexWrap="wrap">
            <Box
              bg={statusBadge.bg}
              px="$2"
              py="$1"
              borderRadius="$md"
              flexDirection="row"
              alignItems="center"
              gap="$1"
            >
              <MaterialCommunityIcons
                name={statusBadge.icon as any}
                size={14}
                color={statusBadge.color}
              />
              <Text size="xs" color={statusBadge.color} fontWeight="$medium">
                {statusBadge.label}
              </Text>
            </Box>

            {/* Expiry Date */}
            {item.expiryDate && (
              <HStack gap="$1" alignItems="center">
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={isItemExpired ? (colors.isDark ? '#f87171' : '#dc2626') : colors.text.muted}
                />
                <Text
                  size="xs"
                  color={isItemExpired ? (colors.isDark ? '#f87171' : '#dc2626') : colors.text.secondary}
                >
                  {isItemExpired ? 'Expired' : 'Exp'} {formatRelativeDate(item.expiryDate)}
                </Text>
              </HStack>
            )}

            {/* Low Stock Threshold Info */}
            {isItemLowStock && (
              <Text size="xs" color={colors.isDark ? '#fbbf24' : '#d97706'}>
                • Below {item.lowStockThreshold} {item.unit}
              </Text>
            )}
          </HStack>

          {/* Quantity Controls */}
          <HStack
            gap="$4"
            mt="$2"
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack gap="$3" alignItems="center">
              <Text size="sm" color={colors.text.secondary}>
                Stock:
              </Text>
              <Box
                bg={stockLevel === 'critical' ? (colors.isDark ? '#450a0a' : '#fef2f2') : 'transparent'}
                px="$2"
                py="$1"
                borderRadius="$md"
              >
                <Text
                  size="xl"
                  fontWeight="$bold"
                  color={stockColor}
                >
                  {item.quantity}
                </Text>
              </Box>
              <Text size="sm" color={colors.text.muted}>
                {item.unit}
              </Text>
            </HStack>

            {/* Increment/Decrement Buttons */}
            <HStack gap="$2" alignItems="center">
              <Button
                size="sm"
                variant="outline"
                onPress={onDecrement}
                isDisabled={item.quantity === 0}
                borderColor={colors.border.primary}
                bg={colors.background.input}
                px="$3"
              >
                <MaterialCommunityIcons name="minus" size={16} color={colors.text.secondary} />
              </Button>
              <Button
                size="sm"
                onPress={onIncrement}
                bg={colors.isDark ? '$primary500' : '$primary600'}
                px="$4"
              >
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="plus" size={16} color="white" />
                  <Text color="white" fontWeight="$medium" size="sm">Add</Text>
                </HStack>
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}
