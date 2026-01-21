/**
 * History Page
 * Read-only view of grouped transactions with aggregation
 * 
 * Features:
 * - Group by day, week, month, year, or custom range
 * - Income/Expense toggle (never mixed)
 * - Running balance calculation
 * - Drill-down to transaction details
 * - Filter by category, account, tags, date range
 */

import { DrillDownModal } from '@/components/history/DrillDownModal';
import { HistoryGroup, SummaryCard } from '@/components/history/HistoryGroup';
import { useSidebarState } from '@/components/sidebar/hooks/useSidebarState';
import { useThemedColors } from '@/constants/colors';
import {
  selectExpenseCategories,
  selectExpenseTransactions,
  selectFilters,
  selectIncomeCategories,
  selectIncomeTransactions,
} from '@/src/store/transactionSlice';
import { TransactionType } from '@/src/types/transaction';
import {
  applyFilters,
  calculateRunningBalances,
  filterByType,
  getCurrentMonthRange,
  GroupingType,
  groupTransactions,
  HistoryFilters,
  TransactionGroup,
} from '@/src/utils/historyHelpers';
import { getUniqueTags } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Heading,
  HStack,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export default function History() {
  const colors = useThemedColors();
  const router = useRouter();
  const sidebarState = useSidebarState();
  
  // Responsive layout
  const isMobile = sidebarState.isMobile;
  
  // Redux state (read-only)
  const incomeTransactions = useSelector(selectIncomeTransactions);
  const expenseTransactions = useSelector(selectExpenseTransactions);
  const incomeCategories = useSelector(selectIncomeCategories);
  const expenseCategories = useSelector(selectExpenseCategories);
  const transactionFilters = useSelector(selectFilters);
  
  // Local state
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [grouping, setGrouping] = useState<GroupingType>('month');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(getCurrentMonthRange());
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [drillDownGroup, setDrillDownGroup] = useState<TransactionGroup | null>(null);
  
  // Get current categories based on type
  const currentCategories = activeType === 'income' ? incomeCategories : expenseCategories;
  const currentTransactions = activeType === 'income' ? incomeTransactions : expenseTransactions;
  
  // Get all unique tags
  const allTags = useMemo(() => {
    return getUniqueTags([...incomeTransactions, ...expenseTransactions]);
  }, [incomeTransactions, expenseTransactions]);
  
  // Build filters
  const historyFilters: HistoryFilters = {
    type: activeType,
    grouping,
    dateRange,
    category: selectedCategory,
    account: selectedAccount,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    search: searchQuery || undefined,
    includeDeleted: showDeleted,
  };
  
  // Filter and group transactions
  const { groups, runningBalances, grandTotal, transactionCount } = useMemo(() => {
    // Apply type filter and include deleted based on toggle
    let filtered = filterByType(
      [...incomeTransactions, ...expenseTransactions],
      activeType,
      showDeleted
    );
    
    // Apply additional filters
    filtered = applyFilters(filtered, historyFilters);
    
    // Sort by date ascending for grouping
    filtered.sort((a, b) => a.date.localeCompare(b.date));
    
    // Group transactions
    const grouped = groupTransactions(filtered, grouping);
    
    // Calculate running balances
    const balances = calculateRunningBalances(grouped);
    const balanceMap = new Map(balances.map((b) => [b.groupId, b.runningBalance]));
    
    // Calculate totals
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      groups: grouped,
      runningBalances: balanceMap,
      grandTotal: total,
      transactionCount: filtered.length,
    };
  }, [incomeTransactions, expenseTransactions, activeType, grouping, dateRange, selectedCategory, selectedAccount, selectedTags, searchQuery, showDeleted]);
  
  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };
  
  // Expand/collapse all groups
  const expandAll = () => {
    setExpandedGroups(new Set(groups.map((g) => g.id)));
  };
  
  const collapseAll = () => {
    setExpandedGroups(new Set());
  };
  
  // Handle drill down
  const handleGroupPress = (group: TransactionGroup) => {
    setDrillDownGroup(group);
  };
  
  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== 'all' ||
      selectedAccount !== 'all' ||
      selectedTags.length > 0 ||
      searchQuery !== '' ||
      showDeleted
    );
  }, [selectedCategory, selectedAccount, selectedTags, searchQuery, showDeleted]);
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedTags([]);
    setSearchQuery('');
    setShowDeleted(false);
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  
  // Render header
  const renderHeader = () => (
    <VStack gap="$4" mb="$4">
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack>
          <Heading size="xl" color={colors.text.primary}>
            History
          </Heading>
          <Text size="sm" color={colors.text.muted}>
            Explore your financial history
          </Text>
        </VStack>
      </HStack>
      
      {/* Income / Expense Toggle */}
      <HStack gap="$3">
        <Pressable
          flex={1}
          onPress={() => setActiveType('expense')}
          py="$3"
          borderRadius="$md"
          borderWidth={2}
          borderColor={activeType === 'expense' ? '$error500' : colors.border.primary}
          bg={activeType === 'expense' ? (colors.isDark ? '#450a0a' : '#fef2f2') : 'transparent'}
          alignItems="center"
          justifyContent="center"
        >
          <HStack gap="$2" alignItems="center">
            <MaterialCommunityIcons
              name="trending-down"
              size={18}
              color={activeType === 'expense' ? '#ef4444' : colors.text.muted}
            />
            <Text
              fontWeight="$semibold"
              color={activeType === 'expense' ? '#ef4444' : colors.text.muted}
            >
              Expenses
            </Text>
          </HStack>
        </Pressable>
        
        <Pressable
          flex={1}
          onPress={() => setActiveType('income')}
          py="$3"
          borderRadius="$md"
          borderWidth={2}
          borderColor={activeType === 'income' ? '$success500' : colors.border.primary}
          bg={activeType === 'income' ? (colors.isDark ? '#14532d' : '#f0fdf4') : 'transparent'}
          alignItems="center"
          justifyContent="center"
        >
          <HStack gap="$2" alignItems="center">
            <MaterialCommunityIcons
              name="trending-up"
              size={18}
              color={activeType === 'income' ? '#22c55e' : colors.text.muted}
            />
            <Text
              fontWeight="$semibold"
              color={activeType === 'income' ? '#22c55e' : colors.text.muted}
            >
              Income
            </Text>
          </HStack>
        </Pressable>
      </HStack>
    </VStack>
  );
  
  // Render controls
  const renderControls = () => (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
      mb="$4"
    >
      <VStack gap="$4">
        {/* Grouping and Search */}
        <HStack gap="$3" flexWrap="wrap">
          {/* Grouping Selector */}
          <VStack flex={1} minWidth={150}>
            <Text size="xs" color={colors.text.muted} mb="$1">
              Group By
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack gap="$2">
                {(['day', 'week', 'month', 'year'] as GroupingType[]).map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGrouping(g)}
                    px="$3"
                    py="$2"
                    borderRadius="$md"
                    bg={grouping === g ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                    borderWidth={1}
                    borderColor={grouping === g ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                  >
                    <Text
                      size="sm"
                      color={grouping === g ? 'white' : colors.text.secondary}
                      textTransform="capitalize"
                    >
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>
          
          {/* Search */}
          <VStack flex={1} minWidth={150}>
            <Text size="xs" color={colors.text.muted} mb="$1">
              Search
            </Text>
            <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
              <InputField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor={colors.text.muted}
                size="sm"
              />
            </Input>
          </VStack>
        </HStack>
        
        {/* Category and Account Filters */}
        <HStack gap="$3" flexWrap="wrap">
          {/* Category */}
          <VStack flex={1} minWidth={140}>
            <Text size="xs" color={colors.text.muted} mb="$1">
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack gap="$2">
                <Pressable
                  onPress={() => setSelectedCategory('all')}
                  px="$3"
                  py="$2"
                  borderRadius="$md"
                  bg={selectedCategory === 'all' ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                  borderWidth={1}
                  borderColor={selectedCategory === 'all' ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                >
                  <Text
                    size="sm"
                    color={selectedCategory === 'all' ? 'white' : colors.text.secondary}
                  >
                    All
                  </Text>
                </Pressable>
                {currentCategories.slice(0, 5).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    px="$3"
                    py="$2"
                    borderRadius="$md"
                    bg={selectedCategory === cat ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                    borderWidth={1}
                    borderColor={selectedCategory === cat ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                  >
                    <Text
                      size="sm"
                      color={selectedCategory === cat ? 'white' : colors.text.secondary}
                      numberOfLines={1}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>
          
          {/* Account */}
          <VStack flex={1} minWidth={120}>
            <Text size="xs" color={colors.text.muted} mb="$1">
              Account
            </Text>
            <HStack gap="$2">
              <Pressable
                flex={1}
                onPress={() => setSelectedAccount('all')}
                px="$3"
                py="$2"
                borderRadius="$md"
                bg={selectedAccount === 'all' ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                borderWidth={1}
                borderColor={selectedAccount === 'all' ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                alignItems="center"
              >
                <Text
                  size="sm"
                  color={selectedAccount === 'all' ? 'white' : colors.text.secondary}
                >
                  All
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                onPress={() => setSelectedAccount('cash')}
                px="$3"
                py="$2"
                borderRadius="$md"
                bg={selectedAccount === 'cash' ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                borderWidth={1}
                borderColor={selectedAccount === 'cash' ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                alignItems="center"
              >
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="cash" size={14} color={selectedAccount === 'cash' ? 'white' : colors.text.secondary} />
                  <Text
                    size="sm"
                    color={selectedAccount === 'cash' ? 'white' : colors.text.secondary}
                  >
                    Cash
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                flex={1}
                onPress={() => setSelectedAccount('card')}
                px="$3"
                py="$2"
                borderRadius="$md"
                bg={selectedAccount === 'card' ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                borderWidth={1}
                borderColor={selectedAccount === 'card' ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                alignItems="center"
              >
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="credit-card-outline" size={14} color={selectedAccount === 'card' ? 'white' : colors.text.secondary} />
                  <Text
                    size="sm"
                    color={selectedAccount === 'card' ? 'white' : colors.text.secondary}
                  >
                    Card
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
          </VStack>
        </HStack>
        
        {/* Tags */}
        {allTags.length > 0 && (
          <VStack>
            <Text size="xs" color={colors.text.muted} mb="$1">
              Tags
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack gap="$2" flexWrap="wrap">
                {allTags.slice(0, 10).map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      px="$3"
                      py="$1.5"
                      borderRadius="$full"
                      bg={isSelected ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                      borderWidth={1}
                      borderColor={isSelected ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                    >
                      <Text
                        size="sm"
                        color={isSelected ? 'white' : colors.text.secondary}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          </VStack>
        )}
        
        {/* Actions Row */}
        <HStack gap="$2" justifyContent="space-between" alignItems="center">
          {/* Show Deleted Toggle */}
          <Pressable onPress={() => setShowDeleted(!showDeleted)}>
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons
                name={showDeleted ? 'eye' : 'eye-off-outline'}
                size={18}
                color={showDeleted ? (colors.isDark ? '#f87171' : '#dc2626') : colors.text.muted}
              />
              <Text
                size="sm"
                color={showDeleted ? (colors.isDark ? '#f87171' : '#dc2626') : colors.text.muted}
              >
                {showDeleted ? 'Showing deleted' : 'Show deleted'}
              </Text>
            </HStack>
          </Pressable>
          
          {/* Expand/Collapse All */}
          {groups.length > 0 && (
            <HStack gap="$2">
              <Pressable onPress={expandAll}>
                <Text size="sm" color={colors.text.secondary}>
                  Expand all
                </Text>
              </Pressable>
              <Text size="sm" color={colors.text.muted}>
                |
              </Text>
              <Pressable onPress={collapseAll}>
                <Text size="sm" color={colors.text.secondary}>
                  Collapse all
                </Text>
              </Pressable>
            </HStack>
          )}
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Pressable onPress={clearFilters}>
              <HStack gap="$1" alignItems="center">
                <MaterialCommunityIcons name="filter-remove" size={16} color={colors.text.muted} />
                <Text size="sm" color={colors.text.muted}>
                  Clear filters
                </Text>
              </HStack>
            </Pressable>
          )}
        </HStack>
      </VStack>
    </Box>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$8"
      alignItems="center"
      justifyContent="center"
    >
      <MaterialCommunityIcons
        name="history"
        size={48}
        color={colors.text.muted}
      />
      <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} mt="$4">
        No transactions found
      </Text>
      <Text size="sm" color={colors.text.muted} mt="$1" textAlign="center">
        {hasActiveFilters
          ? 'Try adjusting your filters or add transactions in the Transactions page.'
          : 'Add transactions in the Transactions page to see your history.'}
      </Text>
    </Box>
  );
  
  return (
    <Box flex={1} bg={colors.background.primary} p={isMobile ? '$4' : '$6'}>
      {renderHeader()}
      {renderControls()}
      
      {/* Summary Card */}
      {groups.length > 0 && (
        <SummaryCard
          total={grandTotal}
          transactionCount={transactionCount}
          runningBalance={runningBalances.get(groups[groups.length - 1]?.id) || 0}
          type={activeType}
        />
      )}
      
      {/* Groups */}
      <ScrollView flex={1}>
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <VStack gap="$2">
            {groups.map((group) => (
              <HistoryGroup
                key={group.id}
                group={group}
                runningBalance={runningBalances.get(group.id) || 0}
                isExpanded={expandedGroups.has(group.id)}
                onToggleExpand={() => toggleGroup(group.id)}
                onPressTotal={() => handleGroupPress(group)}
                showDeleted={showDeleted}
              />
            ))}
          </VStack>
        )}
      </ScrollView>
      
      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={!!drillDownGroup}
        onClose={() => setDrillDownGroup(null)}
        group={drillDownGroup}
        showDeleted={showDeleted}
      />
    </Box>
  );
}

