/**
 * Category Analysis Card Component
 * Displays full category-wise expense breakdown
 */

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { CategoryAnalysis } from '@/src/utils/reportHelpers';
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

interface CategoryAnalysisCardProps {
  categories: CategoryAnalysis[];
  totalExpense: number;
  onCategoryPress: (category: string) => void;
}

export function CategoryAnalysisCard({
  categories,
  totalExpense,
  onCategoryPress,
}: CategoryAnalysisCardProps) {
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
      <VStack gap="$4" h="100%">
        {/* Header */}
        <HStack alignItems="center" gap="$2">
          <Box bg={colors.isDark ? '#1e3a5f' : '#eff6ff'} p="$2" borderRadius="$md">
            <MaterialCommunityIcons
              name="view-grid"
              size={18}
              color={colors.isDark ? '#60a5fa' : '#3b82f6'}
            />
          </Box>
          <VStack flex={1}>
            <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
              Category Analysis
            </Text>
            <Text size="xs" color={colors.text.muted}>
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} • {currencySymbol}{formatCurrencyWithSymbol(totalExpense, currencySymbol, false)} total
            </Text>
          </VStack>
        </HStack>
        
        {/* Category List */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack gap="$2">
            {categories.length === 0 ? (
              <Box py="$8" alignItems="center">
                <MaterialCommunityIcons
                  name="inbox-outline"
                  size={32}
                  color={colors.text.muted}
                />
                <Text size="sm" color={colors.text.muted} mt="$2">
                  No expense data available
                </Text>
              </Box>
            ) : (
              categories.map((category, index) => (
                <CategoryAnalysisItem
                  key={category.category}
                  category={category}
                  index={index}
                  total={totalExpense}
                  currencySymbol={currencySymbol}
                  onPress={() => onCategoryPress(category.category)}
                />
              ))
            )}
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
}

/**
 * Single Category Analysis item row
 */
interface CategoryAnalysisItemProps {
  category: CategoryAnalysis;
  index: number;
  total: number;
  onPress: () => void;
  currencySymbol?: string;
}

function CategoryAnalysisItem({
  category,
  index,
  total,
  onPress,
  currencySymbol = '$',
}: CategoryAnalysisItemProps) {
  const colors = useThemedColors();
  
  // Alternate row styling for readability
  const rowBg = index % 2 === 0 
    ? colors.background.secondary 
    : 'transparent';
  
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <HStack
        bg={rowBg}
        borderRadius="$md"
        p="$3"
        alignItems="center"
        gap="$3"
      >
        {/* Category Info */}
        <VStack flex={1}>
          <HStack gap="$2" alignItems="center">
            <Text size="sm" fontWeight="$semibold" color={colors.text.primary} numberOfLines={1}>
              {category.category}
            </Text>
          </HStack>
          <Text size="xs" color={colors.text.muted}>
            {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
          </Text>
        </VStack>
        
        {/* Percentage Bar */}
        <Box w={80}>
          <HStack alignItems="center" gap="$2">
            <Box flex={1} h="$1.5" borderRadius="$full" bg={colors.border.primary} overflow="hidden">
              <Box
                h="100%"
                w={`${category.percentage}%`}
                bg="#ef4444"
                borderRadius="$full"
              />
            </Box>
            <Text size="xs" color={colors.text.muted} w={36} textAlign="right">
              {category.percentage.toFixed(1)}%
            </Text>
          </HStack>
        </Box>
        
        {/* Amount */}
        <Text size="md" fontWeight="$bold" color="#ef4444" w={80} textAlign="right">
          {formatCurrencyWithSymbol(category.total, currencySymbol)}
        </Text>
      </HStack>
    </Pressable>
  );
}

