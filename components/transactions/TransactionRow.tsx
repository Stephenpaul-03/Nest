/**
 * Transaction Row Component
 * Displays a single transaction in the transactions list
 */

import { useThemedColors } from '@/constants/colors';
import { Transaction } from '@/src/types/transaction';
import { formatCurrency, formatDate } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Box,
    HStack,
    Pressable,
    Text,
    VStack,
} from '@gluestack-ui/themed';
import React from 'react';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const colors = useThemedColors();
  
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  const iconBg = isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#450a0a' : '#fef2f2');
  const iconColor = isIncome ? '#22c55e' : '#ef4444';
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
      mb="$2"
    >
      <HStack gap="$4" alignItems="flex-start">
        {/* Type Icon */}
        <Box bg={iconBg} p="$3" borderRadius="$lg" mt="$1">
          <MaterialCommunityIcons
            name={isIncome ? 'trending-up' : 'trending-down'}
            size={24}
            color={iconColor}
          />
        </Box>
        
        {/* Main Content */}
        <VStack flex={1} gap="$2">
          {/* Category and Date */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} gap="$1">
              <HStack gap="$2" alignItems="center" flexWrap="wrap">
                <Text
                  size="lg"
                  fontWeight="$semibold"
                  color={colors.text.primary}
                  numberOfLines={1}
                >
                  {transaction.category}
                </Text>
              </HStack>
              <HStack gap="$2" alignItems="center">
                <Text size="sm" color={colors.text.muted}>
                  {formatDate(transaction.date)}
                </Text>
                <Box w="$1" h="$1" borderRadius="$full" bg={colors.text.muted} />
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons
                    name={transaction.account === 'cash' ? 'cash' : 'credit-card-outline'}
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text size="sm" color={colors.text.muted}>
                    {transaction.account === 'cash' ? 'Cash' : 'Card'}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
            
            {/* Amount */}
            <Text
              size="xl"
              fontWeight="$bold"
              color={amountColor}
            >
              {isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
            </Text>
          </HStack>
          
          {/* Notes and Tags */}
          {(transaction.notes || (transaction.tags && transaction.tags.length > 0)) && (
            <VStack gap="$1">
              {transaction.notes && (
                <Text size="sm" color={colors.text.secondary} numberOfLines={2}>
                  {transaction.notes}
                </Text>
              )}
              {transaction.tags && transaction.tags.length > 0 && (
                <HStack gap="$1" flexWrap="wrap">
                  {transaction.tags.map((tag) => (
                    <Box
                      key={tag}
                      bg={colors.background.secondary}
                      px="$2"
                      py="$0.5"
                      borderRadius="$md"
                    >
                      <Text size="xs" color={colors.text.muted}>
                        {tag}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              )}
            </VStack>
          )}
          
          {/* Action Buttons */}
          <HStack gap="$1" mt="$1">
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              p="$2"
              borderRadius="$md"
              bg={colors.background.input}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
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
        </VStack>
      </HStack>
    </Box>
  );
}

/**
 * Transaction Row Compact Version (for mobile/smaller displays)
 */
export function TransactionRowCompact({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const colors = useThemedColors();
  
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$md"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$3"
      mb="$1"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap="$3" alignItems="center" flex={1}>
          <Box
            bg={isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#450a0a' : '#fef2f2')}
            p="$2"
            borderRadius="$md"
          >
            <MaterialCommunityIcons
              name={isIncome ? 'trending-up' : 'trending-down'}
              size={18}
              color={isIncome ? '#22c55e' : '#ef4444'}
            />
          </Box>
          
          <VStack flex={1} gap="$0.5">
            <Text
              size="sm"
              fontWeight="$semibold"
              color={colors.text.primary}
              numberOfLines={1}
            >
              {transaction.category}
            </Text>
            <HStack gap="$2" alignItems="center">
              <Text size="xs" color={colors.text.muted}>
                {formatDate(transaction.date)}
              </Text>
              {transaction.tags && transaction.tags.length > 0 && (
                <>
                  <Box w="$1" h="$1" borderRadius="$full" bg={colors.text.muted} />
                  <Text size="xs" color={colors.text.muted} numberOfLines={1}>
                    {transaction.tags[0]}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </HStack>
        
        <HStack gap="$2" alignItems="center">
          <Text
            size="lg"
            fontWeight="$bold"
            color={amountColor}
          >
            {isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
          </Text>
          
          <Pressable onPress={onEdit} hitSlop={8} p="$1">
            <MaterialCommunityIcons
              name="pencil-outline"
              size={14}
              color={colors.text.muted}
            />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8} p="$1">
            <MaterialCommunityIcons
              name="delete-outline"
              size={14}
              color="#ef4444"
            />
          </Pressable>
        </HStack>
      </HStack>
    </Box>
  );
}

