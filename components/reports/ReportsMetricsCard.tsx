/**
 * Reports Metrics Card Component
 * Displays a single metric with trend information
 */

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { formatCurrencyWithSymbol } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';
import { useSelector } from 'react-redux';

interface ReportsMetricsCardProps {
  title: string;
  value: number;
  change?: {
    text: string;
    color: string;
    indicator: 'increased' | 'decreased' | 'neutral';
  };
  subtitle?: string;
  isPositive?: boolean;
  onPress?: () => void;
}

export function ReportsMetricsCard({
  title,
  value,
  change,
  subtitle,
  isPositive,
  onPress,
}: ReportsMetricsCardProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  const valueColor = isPositive === undefined 
    ? colors.text.primary
    : isPositive 
      ? (colors.isDark ? '#4ade80' : '#16a34a')
      : (colors.isDark ? '#f87171' : '#dc2626');
  
  const content = (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
      flex={1}
    >
      <VStack gap="$2">
        {/* Title */}
        <Text size="sm" color={colors.text.muted} fontWeight="$medium">
          {title}
        </Text>
        
        {/* Value */}
        <Text size="2xl" fontWeight="$bold" color={valueColor}>
          {formatCurrencyWithSymbol(value, currencySymbol)}
        </Text>
        
        {/* Change indicator */}
        {change && (
          <HStack gap="$1" alignItems="center">
            <MaterialCommunityIcons
              name={
                change.indicator === 'increased' 
                  ? 'arrow-up' 
                  : change.indicator === 'decreased'
                    ? 'arrow-down'
                    : 'minus'
              }
              size={14}
              color={change.color}
            />
            <Text size="sm" color={change.color}>
              {change.text}
            </Text>
          </HStack>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <Text size="xs" color={colors.text.muted}>
            {subtitle}
          </Text>
        )}
      </VStack>
    </Box>
  );
  
  // Wrap in Pressable if onPress is provided
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {content}
      </Pressable>
    );
  }
  
  return content;
}

/**
 * Net Balance Card with special styling
 */
interface NetBalanceCardProps {
  income: number;
  expense: number;
  change?: {
    text: string;
    color: string;
    indicator: 'increased' | 'decreased' | 'neutral';
  };
}

export function NetBalanceCard({ income, expense, change }: NetBalanceCardProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  const netBalance = income - expense;
  const isPositive = netBalance >= 0;
  const valueColor = isPositive 
    ? (colors.isDark ? '#4ade80' : '#16a34a')
    : (colors.isDark ? '#f87171' : '#dc2626');
  
  return (
    <Box
      bg={isPositive 
        ? (colors.isDark ? '#14532d' : '#f0fdf4')
        : (colors.isDark ? '#450a0a' : '#fef2f2')
      }
      borderRadius="$lg"
      borderWidth={1}
      borderColor={valueColor}
      p="$4"
    >
      <VStack gap="$3">
        {/* Title */}
        <Text size="sm" color={colors.text.muted} fontWeight="$medium">
          Net Balance
        </Text>
        
        {/* Net Balance Value */}
        <HStack alignItems="baseline" gap="$2">
          <Text size="3xl" fontWeight="$bold" color={valueColor}>
            {formatCurrencyWithSymbol(netBalance, currencySymbol)}
          </Text>
          <Text size="sm" color={colors.text.muted}>
            {isPositive ? 'surplus' : 'deficit'}
          </Text>
        </HStack>
        
        {/* Income vs Expense breakdown */}
        <HStack gap="$4" mt="$1">
          <VStack>
            <HStack gap="$1" alignItems="center">
              <MaterialCommunityIcons
                name="trending-up"
                size={14}
                color={colors.isDark ? '#4ade80' : '#16a34a'}
              />
              <Text size="xs" color={colors.text.muted}>
                Income
              </Text>
            </HStack>
            <Text size="sm" fontWeight="$semibold" color={colors.isDark ? '#4ade80' : '#16a34a'}>
              +{formatCurrencyWithSymbol(income, currencySymbol)}
            </Text>
          </VStack>
          
          <VStack>
            <HStack gap="$1" alignItems="center">
              <MaterialCommunityIcons
                name="trending-down"
                size={14}
                color={colors.isDark ? '#f87171' : '#dc2626'}
              />
              <Text size="xs" color={colors.text.muted}>
                Expense
              </Text>
            </HStack>
            <Text size="sm" fontWeight="$semibold" color={colors.isDark ? '#f87171' : '#dc2626'}>
              -{formatCurrencyWithSymbol(expense, currencySymbol)}
            </Text>
          </VStack>
        </HStack>
        
        {/* Change indicator */}
        {change && (
          <HStack gap="$1" alignItems="center" mt="$1">
            <MaterialCommunityIcons
              name={
                change.indicator === 'increased' 
                  ? 'arrow-up' 
                  : change.indicator === 'decreased'
                    ? 'arrow-down'
                    : 'minus'
              }
              size={14}
              color={change.color}
            />
            <Text size="sm" color={change.color}>
              {change.text} vs previous period
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

