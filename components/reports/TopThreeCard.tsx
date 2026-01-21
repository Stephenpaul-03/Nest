/**
 * Top Three Card Component
 * Displays Top 3 spending categories and Top 3 highest spending days
 */

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { TopCategory, TopDay } from '@/src/utils/reportHelpers';
import { formatCurrencyWithSymbol } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';
import { useSelector } from 'react-redux';

interface TopThreeCardProps {
  topCategories: TopCategory[];
  topDays: TopDay[];
  onCategoryPress: (category: string) => void;
  onDayPress: (date: string) => void;
}

export function TopThreeCard({
  topCategories,
  topDays,
  onCategoryPress,
  onDayPress,
}: TopThreeCardProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
      h="100%"
    >
      <VStack gap="$4">
        {/* Header */}
        <HStack alignItems="center" gap="$2">
          <Box bg={colors.isDark ? '#450a0a' : '#fef2f2'} p="$2" borderRadius="$md">
            <MaterialCommunityIcons
              name="trophy"
              size={18}
              color="#ef4444"
            />
          </Box>
          <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
            Top 3s
          </Text>
        </HStack>
        
        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack gap="$6">
            {/* Top 3 Categories */}
            <VStack gap="$2">
              <Text size="sm" color={colors.text.muted} fontWeight="$medium">
                Highest Spending Categories
              </Text>
              <VStack gap="$2">
                {topCategories.length === 0 ? (
                  <Text size="sm" color={colors.text.muted} fontStyle="italic">
                    No expense data available
                  </Text>
                ) : (
                  topCategories.map((item, index) => (
                    <Pressable
                      key={item.category}
                      onPress={() => onCategoryPress(item.category)}
                      hitSlop={8}
                    >
                      <TopThreeItem
                        rank={index + 1}
                        label={item.category}
                        value={item.total}
                        currencySymbol={currencySymbol}
                        subtitle={`${item.transactionCount} transaction${item.transactionCount !== 1 ? 's' : ''} • ${item.percentage.toFixed(1)}% of total`}
                      />
                    </Pressable>
                  ))
                )}
              </VStack>
            </VStack>
            
            {/* Divider */}
            <Box h="$px" bg={colors.border.primary} />
            
            {/* Top 3 Days */}
            <VStack gap="$2">
              <Text size="sm" color={colors.text.muted} fontWeight="$medium">
                Highest Spending Days
              </Text>
              <VStack gap="$2">
                {topDays.length === 0 ? (
                  <Text size="sm" color={colors.text.muted} fontStyle="italic">
                    No expense data available
                  </Text>
                ) : (
                  topDays.map((item, index) => (
                    <Pressable
                      key={item.date}
                      onPress={() => onDayPress(item.date)}
                      hitSlop={8}
                    >
                      <TopThreeItem
                        rank={index + 1}
                        label={formatDayLabel(item.date)}
                        value={item.total}
                        currencySymbol={currencySymbol}
                        subtitle={`${item.transactionCount} transaction${item.transactionCount !== 1 ? 's' : ''}`}
                      />
                    </Pressable>
                  ))
                )}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
}

/**
 * Single Top 3 item row
 */
interface TopThreeItemProps {
  rank: number;
  label: string;
  value: number;
  subtitle: string;
  currencySymbol?: string;
}

function TopThreeItem({ rank, label, value, subtitle, currencySymbol = '$' }: TopThreeItemProps) {
  const colors = useThemedColors();
  
  // Rank badge colors
  const rankColors = [
    { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' }, // Gold
    { bg: colors.background.secondary, text: colors.text.muted, border: colors.border.primary }, // Silver
    { bg: colors.isDark ? '#451a03' : '#fff7ed', text: '#c2410c', border: '#ea580c' }, // Bronze
  ];
  const rankStyle = rankColors[rank - 1] || rankColors[1];
  
  return (
    <HStack
      bg={colors.background.secondary}
      borderRadius="$md"
      p="$3"
      alignItems="center"
      gap="$3"
      borderWidth={1}
      borderColor={colors.border.primary}
    >
      {/* Rank Badge */}
      <Box
        w={24}
        h={24}
        borderRadius="$full"
        bg={rankStyle.bg}
        alignItems="center"
        justifyContent="center"
        borderWidth={2}
        borderColor={rankStyle.border}
      >
        <Text size="sm" fontWeight="$bold" color={rankStyle.text}>
          {rank}
        </Text>
      </Box>
      
      {/* Label and Subtitle */}
      <VStack flex={1}>
        <Text size="sm" fontWeight="$semibold" color={colors.text.primary} numberOfLines={1}>
          {label}
        </Text>
        <Text size="xs" color={colors.text.muted}>
          {subtitle}
        </Text>
      </VStack>
      
      {/* Value */}
      <Text size="md" fontWeight="$bold" color="#ef4444">
        {formatCurrencyWithSymbol(value, currencySymbol)}
      </Text>
    </HStack>
  );
}

/**
 * Format day label for display
 */
function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

