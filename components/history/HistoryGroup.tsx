/**
 * History Group Component
 * Displays a grouped set of transactions with total and running balance
 */

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { Transaction } from '@/src/types/transaction';
import { TransactionGroup } from '@/src/utils/historyHelpers';
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

interface HistoryGroupProps {
  group: TransactionGroup;
  runningBalance: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPressTotal?: () => void;
  showDeleted: boolean;
}

export function HistoryGroup({
  group,
  runningBalance,
  isExpanded,
  onToggleExpand,
  onPressTotal,
  showDeleted,
}: HistoryGroupProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  const isIncome = group.transactions[0]?.type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  const iconBg = isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#450a0a' : '#fef2f2');
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      overflow="hidden"
      mb="$3"
    >
      {/* Group Header */}
      <Pressable onPress={onToggleExpand}>
        <HStack
          p="$4"
          justifyContent="space-between"
          alignItems="center"
          bg={colors.background.secondary}
        >
          <HStack alignItems="center" gap="$3">
            <Box bg={iconBg} p="$2" borderRadius="$md">
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={20}
                color={isIncome ? '#22c55e' : '#ef4444'}
              />
            </Box>
            <VStack>
              <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
                {group.label}
              </Text>
              <Text size="sm" color={colors.text.muted}>
                {group.itemCount} transaction{group.itemCount !== 1 ? 's' : ''}
              </Text>
            </VStack>
          </HStack>
          
          <HStack alignItems="center" gap="$4">
            {/* Running Balance */}
            <VStack alignItems="flex-end">
              <Text size="xs" color={colors.text.muted}>
                Running Balance
              </Text>
              <Text
                size="sm"
                fontWeight="$semibold"
                color={runningBalance >= 0 ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626')}
              >
                {formatCurrencyWithSymbol(runningBalance, currencySymbol)}
              </Text>
            </VStack>
            
            {/* Group Total */}
            <Pressable onPress={onPressTotal} hitSlop={8}>
              <VStack alignItems="flex-end">
                <Text size="xs" color={colors.text.muted}>
                  Total
                </Text>
                <Text
                  size="lg"
                  fontWeight="$bold"
                  color={amountColor}
                >
                  {isIncome ? '+' : '-'}{formatCurrencyWithSymbol(group.total, currencySymbol)}
                </Text>
              </VStack>
            </Pressable>
          </HStack>
        </HStack>
      </Pressable>
      
      {/* Expanded Transaction List */}
      {isExpanded && (
        <Box px="$4" pb="$4" pt="$2">
          {group.transactions.map((transaction, index) => (
            <HistoryTransactionItem
              key={transaction.id}
              transaction={transaction}
              showDeleted={showDeleted}
              currencySymbol={currencySymbol}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * Single Transaction Item (for expanded group view)
 */
interface HistoryTransactionItemProps {
  transaction: Transaction;
  showDeleted: boolean;
  currencySymbol?: string;
}

function HistoryTransactionItem({
  transaction,
  showDeleted,
  currencySymbol = '$',
}: HistoryTransactionItemProps) {
  const colors = useThemedColors();
  
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  const isDeleted = transaction.deleted && showDeleted;
  
  return (
    <HStack
      py="$3"
      borderTopWidth={1}
      borderColor={colors.border.primary}
      justifyContent="space-between"
      alignItems="center"
      opacity={isDeleted ? 0.5 : 1}
    >
      <HStack alignItems="center" gap="$3" flex={1}>
        <Box
          bg={isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#450a0a' : '#fef2f2')}
          p="$2"
          borderRadius="$md"
        >
          <MaterialCommunityIcons
            name={isIncome ? 'trending-up' : 'trending-down'}
            size={16}
            color={isIncome ? '#22c55e' : '#ef4444'}
          />
        </Box>
        
        <VStack flex={1}>
          <HStack gap="$2" alignItems="center" flexWrap="wrap">
            <Text
              size="sm"
              fontWeight="$medium"
              color={colors.text.primary}
              textDecorationLine={isDeleted ? 'line-through' : 'none'}
            >
              {transaction.category}
            </Text>
            {transaction.tags && transaction.tags.length > 0 && (
              <Box bg={colors.background.secondary} px="$1.5" py="$0.5" borderRadius="$sm">
                <Text size="xs" color={colors.text.muted}>
                  {transaction.tags[0]}
                </Text>
              </Box>
            )}
          </HStack>
          <HStack gap="$2" alignItems="center">
            <Text size="xs" color={colors.text.muted}>
              {transaction.date}
            </Text>
            <Box w="$1" h="$1" borderRadius="$full" bg={colors.text.muted} />
            <HStack gap="$1" alignItems="center">
              <MaterialCommunityIcons
                name={transaction.account === 'cash' ? 'cash' : 'credit-card-outline'}
                size={12}
                color={colors.text.muted}
              />
              <Text size="xs" color={colors.text.muted}>
                {transaction.account}
              </Text>
            </HStack>
          </HStack>
          {transaction.notes && (
            <Text size="xs" color={colors.text.muted} numberOfLines={1} mt="$0.5">
              {transaction.notes}
            </Text>
          )}
        </VStack>
      </HStack>
      
      <Text
        size="md"
        fontWeight="$semibold"
        color={amountColor}
        textDecorationLine={isDeleted ? 'line-through' : 'none'}
      >
        {isIncome ? '+' : '-'}{formatCurrencyWithSymbol(transaction.amount, currencySymbol)}
      </Text>
    </HStack>
  );
}

/**
 * Summary Card Component
 * Shows overall totals and balances
 */
interface SummaryCardProps {
  total: number;
  transactionCount: number;
  runningBalance: number;
  type: 'income' | 'expense';
}

export function SummaryCard({
  total,
  transactionCount,
  runningBalance,
  type,
}: SummaryCardProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  const isIncome = type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  const balanceColor = runningBalance >= 0 
    ? (colors.isDark ? '#4ade80' : '#16a34a')
    : (colors.isDark ? '#f87171' : '#dc2626');
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
      mb="$4"
    >
      <HStack justifyContent="space-between">
        <VStack>
          <Text size="xs" color={colors.text.muted}>
            Total {type === 'income' ? 'Income' : 'Expenses'}
          </Text>
          <Text size="xl" fontWeight="$bold" color={amountColor}>
            {formatCurrencyWithSymbol(total, currencySymbol)}
          </Text>
        </VStack>
        
        <VStack alignItems="flex-end">
          <Text size="xs" color={colors.text.muted}>
            Running Balance
          </Text>
          <Text size="xl" fontWeight="$bold" color={balanceColor}>
            {formatCurrencyWithSymbol(runningBalance, currencySymbol)}
          </Text>
        </VStack>
        
        <VStack alignItems="flex-end">
          <Text size="xs" color={colors.text.muted}>
            Transactions
          </Text>
          <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
            {transactionCount}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

