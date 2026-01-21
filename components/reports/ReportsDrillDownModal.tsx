/**
 * Reports Drill-Down Modal Component
 * Shows read-only list of transactions for category or day drill-down
 */

import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { Transaction } from '@/src/types/transaction';
import { DrillDownData } from '@/src/utils/reportHelpers';
import { formatCurrencyWithSymbol, formatDate } from '@/src/utils/transactionHelpers';
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
import { useSelector } from 'react-redux';

interface ReportsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrillDownData | null;
}

export function ReportsDrillDownModal({ isOpen, onClose, data }: ReportsDrillDownModalProps) {
  const colors = useThemedColors();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  if (!data) return null;
  
  const amountColor = '#ef4444'; // Expense color (always expense in reports)
  const iconBg = colors.isDark ? '#450a0a' : '#fef2f2';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader borderBottomWidth={1} borderColor={colors.border.primary} pb="$3" pt="$4">
          <HStack alignItems="center" gap="$3">
            <Box bg={iconBg} p="$2" borderRadius="$md">
              <MaterialCommunityIcons
                name={data.type === 'category' ? 'tag' : 'calendar'}
                size={20}
                color="#ef4444"
              />
            </Box>
            <VStack flex={1}>
              <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
                {data.title}
              </Text>
              <Text size="sm" color={colors.text.muted}>
                {data.subtitle}
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
              {data.transactions.length === 0 ? (
                <Box py="$8" alignItems="center">
                  <MaterialCommunityIcons
                    name="inbox-outline"
                    size={32}
                    color={colors.text.muted}
                  />
                  <Text size="sm" color={colors.text.muted} mt="$2">
                    No transactions to display
                  </Text>
                </Box>
              ) : (
                data.transactions.map((transaction) => (
                  <ReportsDrillDownTransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    amountColor={amountColor}
                    currencySymbol={currencySymbol}
                  />
                ))
              )}
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
 * Transaction item for drill-down view in reports
 */
interface ReportsDrillDownTransactionItemProps {
  transaction: Transaction;
  amountColor: string;
  currencySymbol?: string;
}

function ReportsDrillDownTransactionItem({
  transaction,
  amountColor,
  currencySymbol = '$',
}: ReportsDrillDownTransactionItemProps) {
  const colors = useThemedColors();
  const iconBg = colors.isDark ? '#450a0a' : '#fef2f2';
  
  const isDeleted = transaction.deleted;
  
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
            bg={iconBg}
            p="$2"
            borderRadius="$md"
          >
            <MaterialCommunityIcons
              name="trending-down"
              size={16}
              color="#ef4444"
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
          -{formatCurrencyWithSymbol(transaction.amount, currencySymbol)}
        </Text>
      </HStack>
    </Box>
  );
}

