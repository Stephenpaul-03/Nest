/**
 * Filters Modal Component
 * Filter transactions by date, category, account, and tags
 */

import { useThemedColors } from '@/constants/colors';
import {
  PaymentMethod,
  TransactionFilters,
  TransactionType,
} from '@/src/types/transaction';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React, { useState } from 'react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
  onResetFilters: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  tags: string[];
}

export function FiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  incomeCategories,
  expenseCategories,
  tags,
}: FiltersModalProps) {
  const colors = useThemedColors();
  
  const [localFilters, setLocalFilters] = useState<TransactionFilters>({ ...filters });
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  
  const currentCategories =
    activeTab === 'income' ? incomeCategories : expenseCategories;
  
  const handleReset = () => {
    const emptyFilters: TransactionFilters = {
      category: 'all',
      account: 'all',
      search: '',
    };
    setLocalFilters(emptyFilters);
    onResetFilters();
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleClearDate = () => {
    setLocalFilters((prev) => ({ ...prev, date: undefined }));
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader borderBottomWidth={1} borderColor={colors.border.primary} pb="$3" pt="$4">
          <HStack alignItems="center" gap="$3">
            <Box bg={colors.isDark ? '#1e3a5f' : '#eff6ff'} p="$2" borderRadius="$md">
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color={colors.isDark ? '#60a5fa' : '#2563eb'}
              />
            </Box>
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              Filters
            </Text>
          </HStack>
          <ModalCloseButton position="absolute" right="$3" top="$3">
            <MaterialCommunityIcons name="close" size={20} color={colors.text.muted} />
          </ModalCloseButton>
        </ModalHeader>
        
        <ModalBody py="$4">
          <VStack gap="$5">
            {/* Category Type Tabs */}
            <HStack gap="$3">
              <Pressable
                flex={1}
                onPress={() => {
                  setActiveTab('expense');
                  setLocalFilters((prev) => ({ ...prev, category: 'all' }));
                }}
                py="$2"
                borderRadius="$md"
                borderWidth={1}
                borderColor={activeTab === 'expense' ? '$error500' : colors.border.primary}
                bg={activeTab === 'expense' ? (colors.isDark ? '#450a0a' : '#fef2f2') : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="trending-down"
                    size={16}
                    color={activeTab === 'expense' ? '#ef4444' : colors.text.muted}
                  />
                  <Text
                    fontWeight="$medium"
                    color={activeTab === 'expense' ? '#ef4444' : colors.text.muted}
                    size="sm"
                  >
                    Expenses
                  </Text>
                </HStack>
              </Pressable>
              
              <Pressable
                flex={1}
                onPress={() => {
                  setActiveTab('income');
                  setLocalFilters((prev) => ({ ...prev, category: 'all' }));
                }}
                py="$2"
                borderRadius="$md"
                borderWidth={1}
                borderColor={activeTab === 'income' ? '$success500' : colors.border.primary}
                bg={activeTab === 'income' ? (colors.isDark ? '#14532d' : '#f0fdf4') : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={16}
                    color={activeTab === 'income' ? '#22c55e' : colors.text.muted}
                  />
                  <Text
                    fontWeight="$medium"
                    color={activeTab === 'income' ? '#22c55e' : colors.text.muted}
                    size="sm"
                  >
                    Income
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
            
            {/* Date Range */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="calendar-range" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Date Range</Text>
                </HStack>
              </FormControlLabel>
              
              <HStack gap="$3">
                <VStack flex={1}>
                  <Text size="xs" color={colors.text.muted} mb="$1">From</Text>
                  <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                    <InputField
                      value={localFilters.date?.start || ''}
                      onChangeText={(value) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          date: { ...prev.date, start: value },
                        }))
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                </VStack>
                
                <VStack flex={1}>
                  <Text size="xs" color={colors.text.muted} mb="$1">To</Text>
                  <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                    <InputField
                      value={localFilters.date?.end || ''}
                      onChangeText={(value) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          date: { ...prev.date, end: value },
                        }))
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                </VStack>
              </HStack>
              
              {(localFilters.date?.start || localFilters.date?.end) && (
                <Pressable onPress={handleClearDate} mt="$2">
                  <HStack gap="$1" alignItems="center">
                    <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.text.muted} />
                    <Text size="sm" color={colors.text.muted}>Clear date range</Text>
                  </HStack>
                </Pressable>
              )}
            </FormControl>
            
            {/* Category */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="tag-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Category</Text>
                </HStack>
              </FormControlLabel>
              
              <Select
                selectedValue={localFilters.category}
                onValueChange={(value: string) =>
                  setLocalFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                  <SelectInput placeholder="All categories" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label="All Categories" value="all" />
                    {currentCategories.map((category) => (
                      <SelectItem key={category} label={category} value={category} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>
            
            {/* Account */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="credit-card-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Account</Text>
                </HStack>
              </FormControlLabel>
              
              <Select
                selectedValue={localFilters.account}
                onValueChange={(value: string) =>
                  setLocalFilters((prev) => ({ ...prev, account: value as PaymentMethod | 'all' }))
                }
              >
                <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                  <SelectInput placeholder="All accounts" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label="All Accounts" value="all" />
                    <SelectItem label="Cash" value="cash" />
                    <SelectItem label="Card" value="card" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>
            
            {/* Tags */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="tag-multiple-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Tags</Text>
                </HStack>
              </FormControlLabel>
              
              {tags.length > 0 ? (
                <HStack gap="$2" flexWrap="wrap">
                  {tags.map((tag) => {
                    const isSelected = localFilters.tags?.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        onPress={() => {
                          setLocalFilters((prev) => {
                            const currentTags = prev.tags || [];
                            const newTags = isSelected
                              ? currentTags.filter((t) => t !== tag)
                              : [...currentTags, tag];
                            return { ...prev, tags: newTags.length > 0 ? newTags : undefined };
                          });
                        }}
                      >
                        <Box
                          bg={isSelected ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                          borderColor={isSelected ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                          borderWidth={1}
                          px="$3"
                          py="$1.5"
                          borderRadius="$full"
                        >
                          <Text
                            size="sm"
                            color={isSelected ? 'white' : colors.text.secondary}
                          >
                            {tag}
                          </Text>
                        </Box>
                      </Pressable>
                    );
                  })}
                </HStack>
              ) : (
                <Text size="sm" color={colors.text.muted}>
                  No tags available
                </Text>
              )}
              
              {localFilters.tags && localFilters.tags.length > 0 && (
                <Pressable
                  onPress={() => setLocalFilters((prev) => ({ ...prev, tags: undefined }))}
                  mt="$2"
                >
                  <HStack gap="$1" alignItems="center">
                    <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.text.muted} />
                    <Text size="sm" color={colors.text.muted}>Clear tags filter</Text>
                  </HStack>
                </Pressable>
              )}
            </FormControl>
            
            {/* Search */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="magnify" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Search</Text>
                </HStack>
              </FormControlLabel>
              
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                <InputField
                  value={localFilters.search || ''}
                  onChangeText={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      search: value || undefined,
                    }))
                  }
                  placeholder="Search by category, notes, or tags"
                  placeholderTextColor={colors.text.muted}
                />
              </Input>
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter borderTopWidth={1} borderColor={colors.border.primary} pt="$4" pb="$4">
          <HStack gap="$3" w="100%" justifyContent="space-between">
            <Button variant="outline" onPress={handleReset} borderColor={colors.border.primary} borderRadius="$md">
              <HStack gap="$2" alignItems="center">
                <MaterialCommunityIcons name="filter-remove" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary}>Reset</Text>
              </HStack>
            </Button>
            
            <Button onPress={handleApply} bg={colors.isDark ? '$primary500' : '$primary600'} borderRadius="$md" px="$6">
              <HStack gap="$2" alignItems="center">
                <MaterialCommunityIcons name="check" size={16} color="white" />
                <Text color="white" fontWeight="$semibold">Apply Filters</Text>
              </HStack>
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

