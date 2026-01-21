/**
 * Drill Down Modal Component
 * Shows read-only list of transactions in a group
 */

import { useThemedColors } from '@/constants/colors';
import { Transaction } from '@/src/types/transaction';
import { TransactionGroup } from '@/src/utils/historyHelpers';
import { formatCurrency, formatDate } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: TransactionGroup | null;
  showDeleted: boolean;
}

export function DrillDownModal({ isOpen, onClose, group, showDeleted }: DrillDownModalProps) {
  const colors = useThemedColors();
  
  if (!group) return null;
  
  const isIncome = group.transactions[0]?.type === 'income';
  const amountColor = isIncome ? (colors.isDark ? '#4ade80' : '#16a34a') : (colors.isDark ? '#f87171' : '#dc2626');
  const iconBg = isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#450a0a' : '#fef2f2');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader borderBottomWidth={1} borderColor={colors.border.primary} pb="$3" pt="$4">
          <HStack alignItems="center" gap="$3">
            <Box bg={iconBg} p="$2" borderRadius="$md">
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={20}
                color={isIncome ? '#22c55e' : '#ef4444'}
              />
            </Box>
            <VStack flex={1}>
              <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
                {group.label}
              </Text>
              <Text size="sm" color={colors.text.muted}>
                {group.itemCount} transaction{group.itemCount !== 1 ? 's' : ''} • Total: ${formatCurrency(group.total)}
              </Text>
            </VStack>
          </HStack>
          <ModalCloseButton position="absolute" right="$3" top="$3">
            <MaterialCommunityIcons name="close" size={20} color={colors.text.muted} />
          </ModalCloseButton>
        </ModalHeader>
        
        <ModalBody py="$4">
          <ScrollView maxHeight={400}>
            <VStack gap="$2">
              {group.transactions.map((transaction) => (
                <DrillDownTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  showDeleted={showDeleted}
                  amountColor={amountColor}
                />
              ))}
            </VStack>
          </ScrollView>
        </ModalBody>
        
        <ModalFooter borderTopWidth={1} borderColor={colors.border.primary} pt="$4" pb="$4">
          <Button
            onPress={onClose}
            bg={colors.isDark ? '$primary500' : '$primary600'}
            borderRadius="$md"
            px="$6"
          >
            <Text color="white" fontWeight="$semibold">Close</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Transaction item for drill-down view
 */
interface DrillDownTransactionItemProps {
  transaction: Transaction;
  showDeleted: boolean;
  amountColor: string;
}

function DrillDownTransactionItem({
  transaction,
  showDeleted,
  amountColor,
}: DrillDownTransactionItemProps) {
  const colors = useThemedColors();
  
  const isIncome = transaction.type === 'income';
  const isDeleted = transaction.deleted && showDeleted;
  
  return (
    <Box
      bg={colors.background.secondary}
      borderRadius="$md"
      p="$3"
      opacity={isDeleted ? 0.5 : 1}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
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
                fontWeight="$semibold"
                color={colors.text.primary}
                textDecorationLine={isDeleted ? 'line-through' : 'none'}
              >
                {transaction.category}
              </Text>
              {isDeleted && (
                <Box bg={colors.isDark ? '#450a0a' : '#fef2f2'} px="$1.5" py="$0.5" borderRadius="$sm">
                  <Text size="xs" color={colors.isDark ? '#f87171' : '#dc2626'}>
                    Deleted
                  </Text>
                </Box>
              )}
            </HStack>
            <HStack gap="$2" alignItems="center" flexWrap="wrap">
              <Text size="xs" color={colors.text.muted}>
                {formatDate(transaction.date)}
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
              <Text
                size="xs"
                color={colors.text.muted}
                numberOfLines={2}
                mt="$1"
                fontStyle={isDeleted ? 'italic' : 'normal'}
              >
                {transaction.notes}
              </Text>
            )}
            {transaction.tags && transaction.tags.length > 0 && (
              <HStack gap="$1" flexWrap="wrap" mt="$1">
                {transaction.tags.map((tag) => (
                  <Box
                    key={tag}
                    bg={colors.background.primary}
                    px="$1.5"
                    py="$0.5"
                    borderRadius="$sm"
                  >
                    <Text size="xs" color={colors.text.muted}>
                      {tag}
                    </Text>
                  </Box>
                ))}
              </HStack>
            )}
          </VStack>
        </HStack>
        
        <Text
          size="md"
          fontWeight="$bold"
          color={amountColor}
          textDecorationLine={isDeleted ? 'line-through' : 'none'}
        >
          {isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
        </Text>
      </HStack>
    </Box>
  );
}

/**
 * Empty State Component
 */
interface DrillDownEmptyProps {
  onClose: () => void;
}

export function DrillDownEmpty({ onClose }: DrillDownEmptyProps) {
  const colors = useThemedColors();
  
  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalBody py="$8">
          <VStack alignItems="center" gap="$4">
            <Box bg={colors.background.secondary} p="$4" borderRadius="$full">
              <MaterialCommunityIcons
                name="inbox-outline"
                size={32}
                color={colors.text.muted}
              />
            </Box>
            <Text size="lg" fontWeight="$semibold" color={colors.text.primary}>
              No Transactions
            </Text>
            <Text size="sm" color={colors.text.muted} textAlign="center">
              There are no transactions to display in this group.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth={0}>
          <Button
            onPress={onClose}
            bg={colors.isDark ? '$primary500' : '$primary600'}
            borderRadius="$md"
          >
            <Text color="white" fontWeight="$semibold">Close</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

