/**
 * Transactions Page
 * Source of truth for all financial data
 * 
 * Mobile: Tab-based layout (Expenses | Income)
 * Web: Side-by-side sections (both visible)
 */

import { useSidebarState } from '@/components/sidebar/hooks/useSidebarState';
import { FiltersModal } from '@/components/transactions/FiltersModal';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import {
  duplicateLastTransaction,
  openAddModal,
  openCategoryModal,
  openEditModal,
  repeatLastTransaction,
  resetFilters,
  selectCategoryModalType,
  selectEditingTransactionId,
  selectExpenseCategories,
  selectExpenseTransactions,
  selectFilters,
  selectIncomeCategories,
  selectIncomeTransactions,
  selectIsCategoryModalOpen,
  selectIsModalOpen,
  selectModalMode,
  selectTransactionById,
  setFilters,
  softDeleteTransaction,
} from '@/src/store/transactionSlice';
import { Transaction, TransactionFilters, TransactionType } from '@/src/types/transaction';
import {
  calculateTotal,
  formatCurrencyWithSymbol,
  getUniqueTags,
  matchesFilters,
  sortByDate
} from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Transactions() {
  const dispatch = useDispatch();
  const router = useRouter();
  const colors = useThemedColors();
  const sidebarState = useSidebarState();
  
  // Responsive layout
  const isMobile = sidebarState.isMobile;
  
  // Get currency symbol from workspace settings
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const currencySymbol = useSelector((state: RootState) => 
    state.auth.workspaces[activeWorkspace]?.currencySymbol || state.auth.globalCurrencySymbol
  );
  
  // Redux state
  const incomeTransactions = useSelector(selectIncomeTransactions);
  const expenseTransactions = useSelector(selectExpenseTransactions);
  const incomeCategories = useSelector(selectIncomeCategories);
  const expenseCategories = useSelector(selectExpenseCategories);
  const currentFilters = useSelector(selectFilters);
  
  // Modal state
  const isModalOpen = useSelector(selectIsModalOpen);
  const modalMode = useSelector(selectModalMode);
  const editingTransactionId = useSelector(selectEditingTransactionId);
  const editingTransaction = useSelector(
    editingTransactionId ? selectTransactionById(editingTransactionId) : () => null
  );
  
  // Category modal state
  const isCategoryModalOpen = useSelector(selectIsCategoryModalOpen);
  const categoryModalType = useSelector(selectCategoryModalType);
  
  // Local state
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all unique tags for filter modal
  const allTags = useMemo(() => {
    const allTransactions = [...incomeTransactions, ...expenseTransactions];
    return getUniqueTags(allTransactions);
  }, [incomeTransactions, expenseTransactions]);
  
  // Filter transactions based on current filters and search
  const filteredIncomeTransactions = useMemo(() => {
    let transactions = sortByDate(incomeTransactions);
    
    // Apply filters
    if (currentFilters.search) {
      const filtersWithSearch = { ...currentFilters };
      transactions = transactions.filter((t) => matchesFilters(t, filtersWithSearch));
    }
    
    return transactions;
  }, [incomeTransactions, currentFilters]);
  
  const filteredExpenseTransactions = useMemo(() => {
    let transactions = sortByDate(expenseTransactions);
    
    // Apply filters
    if (currentFilters.search) {
      const filtersWithSearch = { ...currentFilters };
      transactions = transactions.filter((t) => matchesFilters(t, filtersWithSearch));
    }
    
    return transactions;
  }, [expenseTransactions, currentFilters]);
  
  // Calculate totals
  const incomeTotal = calculateTotal(filteredIncomeTransactions);
  const expenseTotal = calculateTotal(filteredExpenseTransactions);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      (currentFilters.category !== 'all' && currentFilters.category !== undefined) ||
      (currentFilters.account !== 'all' && currentFilters.account !== undefined) ||
      (currentFilters.date?.start !== undefined || currentFilters.date?.end !== undefined) ||
      (currentFilters.tags && currentFilters.tags.length > 0) ||
      (currentFilters.search !== undefined && currentFilters.search !== '')
    ) as boolean;
  }, [currentFilters]);
  
  // Quick tool handlers
  const handleAddIncome = () => {
    dispatch(openAddModal('income'));
  };
  
  const handleAddExpense = () => {
    dispatch(openAddModal('expense'));
  };
  
  const handleAddCategory = (type: TransactionType) => {
    dispatch(openCategoryModal(type));
  };
  
  const handleDuplicateLast = (type: TransactionType) => {
    dispatch(duplicateLastTransaction(type));
  };
  
  const handleRepeatLast = (type: TransactionType) => {
    dispatch(repeatLastTransaction(type));
  };
  
  const handleEdit = (id: string) => {
    dispatch(openEditModal(id));
  };
  
  const handleDelete = (id: string) => {
    dispatch(softDeleteTransaction(id));
  };
  
  const handleApplyFilters = (filters: TransactionFilters) => {
    dispatch(setFilters(filters));
  };
  
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };
  
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text) {
      dispatch(setFilters({ search: text }));
    } else {
      dispatch(setFilters({ search: undefined }));
    }
  };
  
  // Category modal submit
  const handleCategorySubmit = () => {
    if (!newCategoryName.trim() || !categoryModalType) return;
    
    if (categoryModalType === 'income') {
      dispatch({ type: 'transactions/addIncomeCategory', payload: newCategoryName.trim() });
    } else {
      dispatch({ type: 'transactions/addExpenseCategory', payload: newCategoryName.trim() });
    }
    
    setNewCategoryName('');
  };
  
  // Render empty state
  const renderEmptyState = (type: TransactionType) => {
    const router = useRouter();
    const colors = useThemedColors();
    
    return (
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
          name={type === 'income' ? 'trending-up' : 'trending-down'}
          size={48}
          color={colors.text.muted}
        />
        <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} mt="$4" textAlign="center">
          No {type === 'income' ? 'income' : 'expenses'} yet
        </Text>
        <Text size="sm" color={colors.text.muted} mt="$1" textAlign="center" mb="$4">
          {type === 'income' 
            ? 'Add your first income entry to start tracking'
            : 'Add your first expense to start tracking'}
        </Text>
        <HStack gap="$3">
          <Pressable
            onPress={() => router.push('/(app)/finance/transactions' as any)}
          >
            <Box
              bg={colors.isDark ? '$primary600' : '$primary500'}
              borderRadius="$md"
              px="$4"
              py="$2"
            >
              <Text color="white" fontWeight="$semibold" size="sm">
                {type === 'income' ? 'Add Income' : 'Add Expense'}
              </Text>
            </Box>
          </Pressable>
        </HStack>
      </Box>
    );
  };
  
  // Render transaction list
  const renderTransactionList = (transactions: Transaction[], type: TransactionType) => {
    if (transactions.length === 0) {
      return renderEmptyState(type);
    }
    
    return (
      <VStack gap="$2">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onEdit={() => handleEdit(transaction.id)}
            onDelete={() => handleDelete(transaction.id)}
            isMobile={isMobile}
          />
        ))}
      </VStack>
    );
  };
  
  // Render Quick Tools section - Mobile optimized
  const renderQuickTools = () => {
    // Mobile: Compact action bar with primary actions only
    if (isMobile) {
      return (
        <Box mb="$3">
          {/* Primary Actions - Large touch targets */}
          <HStack gap="$3" mb="$3">
            <Pressable
              onPress={handleAddIncome}
              flex={1}
              py="$3"
              bg={colors.isDark ? '#14532d' : '#f0fdf4'}
              borderWidth={1}
              borderColor={colors.isDark ? '#22c55e' : '#16a34a'}
              borderRadius="$lg"
              alignItems="center"
              justifyContent="center"
            >
              <HStack gap="$2" alignItems="center">
                <MaterialCommunityIcons name="trending-up" size={20} color="#22c55e" />
                <Text color={colors.isDark ? '#4ade80' : '#16a34a'} fontWeight="$semibold" size="sm">
                  Add Income
                </Text>
              </HStack>
            </Pressable>
            
            <Pressable
              onPress={handleAddExpense}
              flex={1}
              py="$3"
              bg={colors.isDark ? '#450a0a' : '#fef2f2'}
              borderWidth={1}
              borderColor={colors.isDark ? '#ef4444' : '#dc2626'}
              borderRadius="$lg"
              alignItems="center"
              justifyContent="center"
            >
              <HStack gap="$2" alignItems="center">
                <MaterialCommunityIcons name="trending-down" size={20} color="#ef4444" />
                <Text color={colors.isDark ? '#f87171' : '#dc2626'} fontWeight="$semibold" size="sm">
                  Add Expense
                </Text>
              </HStack>
            </Pressable>
          </HStack>
          
          {/* Secondary Actions - Collapsible */}
          <CollapsibleFiltersSection
            filtersOpen={isFiltersModalOpen}
            onToggleFilters={() => setIsFiltersModalOpen(true)}
            hasActiveFilters={hasActiveFilters}
            filterCount={Object.values(currentFilters).filter(v => v !== 'all' && v !== undefined && v !== '' && v !== '').length}
            onNavigateToHistory={() => router.push('/finance/history')}
          />
        </Box>
      );
    }
    
    // Desktop: Original horizontal scroll
    return (
      <Box
        bg={colors.background.card}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.border.primary}
        p="$4"
        mb="$4"
      >
        <Text size="sm" fontWeight="$semibold" color={colors.text.secondary} mb="$3">
          Quick Tools
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack gap="$2" flexWrap="wrap">
            {/* Add Income */}
            <Button
              onPress={handleAddIncome}
              bg={colors.isDark ? '#14532d' : '#f0fdf4'}
              borderColor={colors.isDark ? '#22c55e' : '#16a34a'}
              borderWidth={1}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="trending-up" size={16} color="#22c55e" />
                <Text color={colors.isDark ? '#4ade80' : '#16a34a'} fontWeight="$medium" size="sm">
                  Add Income
                </Text>
              </HStack>
            </Button>
            
            {/* Add Expense */}
            <Button
              onPress={handleAddExpense}
              bg={colors.isDark ? '#450a0a' : '#fef2f2'}
              borderColor={colors.isDark ? '#ef4444' : '#dc2626'}
              borderWidth={1}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="trending-down" size={16} color="#ef4444" />
                <Text color={colors.isDark ? '#f87171' : '#dc2626'} fontWeight="$medium" size="sm">
                  Add Expense
                </Text>
              </HStack>
            </Button>
            
            {/* Add Category */}
            <Button
              onPress={() => handleAddCategory('expense')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="tag-plus-outline" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">Add Category</Text>
              </HStack>
            </Button>
            
            {/* Duplicate Last Income */}
            <Button
              onPress={() => handleDuplicateLast('income')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="content-copy" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">Dup. Last Inc</Text>
              </HStack>
            </Button>
            
            {/* Repeat Last Income */}
            <Button
              onPress={() => handleRepeatLast('income')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="repeat" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">Repeat Inc</Text>
              </HStack>
            </Button>
            
            {/* Duplicate Last Expense */}
            <Button
              onPress={() => handleDuplicateLast('expense')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="content-copy" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">Dup. Last Exp</Text>
              </HStack>
            </Button>
            
            {/* Repeat Last Expense */}
            <Button
              onPress={() => handleRepeatLast('expense')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="repeat" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">Repeat Exp</Text>
              </HStack>
            </Button>
            
            {/* Jump to History */}
            <Button
              onPress={() => router.push('/finance/history')}
              variant="outline"
              borderColor={colors.border.primary}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons name="history" size={16} color={colors.text.secondary} />
                <Text color={colors.text.secondary} size="sm">History</Text>
              </HStack>
            </Button>
            
            {/* Filters */}
            <Button
              onPress={() => setIsFiltersModalOpen(true)}
              variant="outline"
              borderColor={hasActiveFilters ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
              borderWidth={hasActiveFilters ? 2 : 1}
              borderRadius="$md"
              px="$4"
            >
              <HStack gap="$1.5" alignItems="center">
                <MaterialCommunityIcons
                  name={hasActiveFilters ? 'filter-variant' : 'filter-outline'}
                  size={16}
                  color={hasActiveFilters ? (colors.isDark ? '#818cf8' : '#4f46e5') : colors.text.secondary}
                />
                <Text
                  color={hasActiveFilters ? (colors.isDark ? '#818cf8' : '#4f46e5') : colors.text.secondary}
                  size="sm"
                >
                  Filters {hasActiveFilters ? `(${Object.values(currentFilters).filter(v => v !== 'all' && v !== undefined && v !== '').length})` : ''}
                </Text>
              </HStack>
            </Button>
          </HStack>
        </ScrollView>
      </Box>
    );
  };
  
  // Collapsible secondary actions section for mobile
  const CollapsibleFiltersSection = ({ 
    filtersOpen, 
    onToggleFilters, 
    hasActiveFilters, 
    filterCount,
    onNavigateToHistory 
  }: { 
    filtersOpen?: boolean; 
    onToggleFilters: () => void;
    hasActiveFilters: boolean;
    filterCount: number;
    onNavigateToHistory: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <Box>
        {/* Collapsible toggle */}
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          py="$2"
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.text.secondary} 
              />
              <Text size="sm" color={colors.text.secondary}>
                {isExpanded ? 'Less' : 'More options'}
              </Text>
            </HStack>
            
            <HStack gap="$2">
              {/* Filters Button */}
              <Pressable
                onPress={onToggleFilters}
                py="$1.5" px="$3"
                borderRadius="$md"
                bg={hasActiveFilters ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.input}
                borderWidth={1}
                borderColor={hasActiveFilters ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
              >
                <HStack gap="$1.5" alignItems="center">
                  <MaterialCommunityIcons
                    name={hasActiveFilters ? 'filter-variant' : 'filter-outline'}
                    size={16}
                    color={hasActiveFilters ? 'white' : colors.text.secondary}
                  />
                  <Text size="xs" color={hasActiveFilters ? 'white' : colors.text.secondary}>
                    Filters{hasActiveFilters ? ` (${filterCount})` : ''}
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
          </HStack>
        </Pressable>
        
        {/* Expanded secondary actions */}
        {isExpanded && (
          <VStack gap="$2" mt="$2" pt="$2" borderTopWidth={1} borderColor={colors.border.primary}>
            <HStack gap="$2" flexWrap="wrap">
              {/* Add Category */}
              <Pressable
                onPress={() => handleAddCategory('expense')}
                py="$2" px="$3"
                borderRadius="$md"
                bg={colors.background.input}
                borderWidth={1}
                borderColor={colors.border.primary}
              >
                <HStack gap="$1.5" alignItems="center">
                  <MaterialCommunityIcons name="tag-plus-outline" size={16} color={colors.text.secondary} />
                  <Text size="xs" color={colors.text.secondary}>Add Category</Text>
                </HStack>
              </Pressable>
              
              {/* Duplicate Last Expense */}
              <Pressable
                onPress={() => handleDuplicateLast('expense')}
                py="$2" px="$3"
                borderRadius="$md"
                bg={colors.background.input}
                borderWidth={1}
                borderColor={colors.border.primary}
              >
                <HStack gap="$1.5" alignItems="center">
                  <MaterialCommunityIcons name="content-copy" size={16} color={colors.text.secondary} />
                  <Text size="xs" color={colors.text.secondary}>Dup. Last Exp</Text>
                </HStack>
              </Pressable>
              
              {/* Duplicate Last Income */}
              <Pressable
                onPress={() => handleDuplicateLast('income')}
                py="$2" px="$3"
                borderRadius="$md"
                bg={colors.background.input}
                borderWidth={1}
                borderColor={colors.border.primary}
              >
                <HStack gap="$1.5" alignItems="center">
                  <MaterialCommunityIcons name="content-copy" size={16} color={colors.text.secondary} />
                  <Text size="xs" color={colors.text.secondary}>Dup. Last Inc</Text>
                </HStack>
              </Pressable>
              
              {/* History */}
              <Pressable
                onPress={onNavigateToHistory}
                py="$2" px="$3"
                borderRadius="$md"
                bg={colors.background.input}
                borderWidth={1}
                borderColor={colors.border.primary}
              >
                <HStack gap="$1.5" alignItems="center">
                  <MaterialCommunityIcons name="history" size={16} color={colors.text.secondary} />
                  <Text size="xs" color={colors.text.secondary}>History</Text>
                </HStack>
              </Pressable>
            </HStack>
          </VStack>
        )}
      </Box>
    );
  };
  
  // Render Mobile Layout (Tabs)
  const renderMobileLayout = () => (
    <VStack flex={1} gap="$4">
      {/* Search */}
      <Input bg={colors.background.card} borderColor={colors.border.primary} borderRadius="$md">
        <InputField
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor={colors.text.muted}
        />
        <Box pr="$3">
          <MaterialCommunityIcons name="magnify" size={20} color={colors.text.muted} />
        </Box>
      </Input>
      
      {/* Quick Tools */}
      {renderQuickTools()}
      
      {/* Full-width Tab Navigation */}
      <Box bg={colors.background.card} borderRadius="$lg" borderWidth={1} borderColor={colors.border.primary} p="$2">
        <HStack gap="$2">
          {/* Expense Tab */}
          <Pressable
            flex={1}
            onPress={() => setActiveTab('expense')}
            py="$3"
            borderRadius="$md"
            bg={activeTab === 'expense' ? (colors.isDark ? '#450a0a' : '#fef2f2') : 'transparent'}
            borderWidth={2}
            borderColor={activeTab === 'expense' ? '#ef4444' : 'transparent'}
          >
            <VStack alignItems="center" gap="$1">
              <MaterialCommunityIcons
                name="trending-down"
                size={22}
                color={activeTab === 'expense' ? '#ef4444' : colors.text.muted}
              />
              <Text
                fontWeight="$bold"
                color={activeTab === 'expense' ? '#ef4444' : colors.text.muted}
                size="sm"
              >
                Expenses
              </Text>
              <Text size="xs" color={colors.text.muted} fontWeight="$semibold">
                {currencySymbol}{formatCurrencyWithSymbol(expenseTotal, currencySymbol, false)}
              </Text>
            </VStack>
          </Pressable>
          
          {/* Income Tab */}
          <Pressable
            flex={1}
            onPress={() => setActiveTab('income')}
            py="$3"
            borderRadius="$md"
            bg={activeTab === 'income' ? (colors.isDark ? '#14532d' : '#f0fdf4') : 'transparent'}
            borderWidth={2}
            borderColor={activeTab === 'income' ? '#22c55e' : 'transparent'}
          >
            <VStack alignItems="center" gap="$1">
              <MaterialCommunityIcons
                name="trending-up"
                size={22}
                color={activeTab === 'income' ? '#22c55e' : colors.text.muted}
              />
              <Text
                fontWeight="$bold"
                color={activeTab === 'income' ? '#22c55e' : colors.text.muted}
                size="sm"
              >
                Income
              </Text>
              <Text size="xs" color={colors.text.muted} fontWeight="$semibold">
                {currencySymbol}{formatCurrencyWithSymbol(incomeTotal, currencySymbol, false)}
              </Text>
            </VStack>
          </Pressable>
        </HStack>
      </Box>
      
      {/* Tab Content */}
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {activeTab === 'expense'
          ? renderTransactionList(filteredExpenseTransactions, 'expense')
          : renderTransactionList(filteredIncomeTransactions, 'income')}
      </ScrollView>
      
      {/* Sticky bottom quick actions */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg={colors.background.primary}
        borderTopWidth={1}
        borderColor={colors.border.primary}
        p="$3"
      >
        <HStack gap="$3">
          <Pressable
            flex={1}
            onPress={handleAddIncome}
            py="$3"
            bg={colors.isDark ? '#14532d' : '#f0fdf4'}
            borderWidth={1}
            borderColor={colors.isDark ? '#22c55e' : '#16a34a'}
            borderRadius="$lg"
            alignItems="center"
            justifyContent="center"
          >
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons name="plus" size={20} color="#22c55e" />
              <Text color={colors.isDark ? '#4ade80' : '#16a34a'} fontWeight="$bold" size="sm">
                Income
              </Text>
            </HStack>
          </Pressable>
          
          <Pressable
            flex={1}
            onPress={handleAddExpense}
            py="$3"
            bg={colors.isDark ? '#7f1d1d' : '#fef2f2'}
            borderWidth={1}
            borderColor={colors.isDark ? '#ef4444' : '#dc2626'}
            borderRadius="$lg"
            alignItems="center"
            justifyContent="center"
          >
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons name="plus" size={20} color="#ef4444" />
              <Text color={colors.isDark ? '#f87171' : '#dc2626'} fontWeight="$bold" size="sm">
                Expense
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </Box>
    </VStack>
  );
  
  // Render Web Layout (Side by Side)
  const renderWebLayout = () => (
    <VStack flex={1} gap="$4">
      {/* Search */}
      <Input bg={colors.background.card} borderColor={colors.border.primary} borderRadius="$md" maxWidth={400}>
        <InputField
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor={colors.text.muted}
        />
        <Box pr="$3">
          <MaterialCommunityIcons name="magnify" size={20} color={colors.text.muted} />
        </Box>
      </Input>
      
      {/* Quick Tools */}
      {renderQuickTools()}
      
      {/* Side by Side Layout */}
      <HStack gap="$4" flex={1}>
        {/* Expenses Column */}
        <VStack flex={1} gap="$3">
          <HStack alignItems="center" gap="$2">
            <Box bg={colors.isDark ? '#450a0a' : '#fef2f2'} p="$2" borderRadius="$md">
              <MaterialCommunityIcons name="trending-down" size={20} color="#ef4444" />
            </Box>
            <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
              Expenses
            </Text>
            <Text size="sm" color={colors.text.muted}>
              ({currencySymbol}{formatCurrencyWithSymbol(expenseTotal, currencySymbol, false)})
            </Text>
          </HStack>
          
          <ScrollView flex={1}>
            {renderTransactionList(filteredExpenseTransactions, 'expense')}
          </ScrollView>
        </VStack>
        
        {/* Divider */}
        <Box w={1} bg={colors.border.primary} />
        
        {/* Income Column */}
        <VStack flex={1} gap="$3">
          <HStack alignItems="center" gap="$2">
            <Box bg={colors.isDark ? '#14532d' : '#f0fdf4'} p="$2" borderRadius="$md">
              <MaterialCommunityIcons name="trending-up" size={20} color="#22c55e" />
            </Box>
            <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
              Income
            </Text>
            <Text size="sm" color={colors.text.muted}>
              ({currencySymbol}{formatCurrencyWithSymbol(incomeTotal, currencySymbol, false)})
            </Text>
          </HStack>
          
          <ScrollView flex={1}>
            {renderTransactionList(filteredIncomeTransactions, 'income')}
          </ScrollView>
        </VStack>
      </HStack>
    </VStack>
  );
  
  return (
    <Box flex={1} bg={colors.background.primary} p={isMobile ? '$4' : '$6'}>
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center" mb="$4">
        <VStack>
          <Heading size="xl" color={colors.text.primary}>
            Transactions
          </Heading>
          <Text size="sm" color={colors.text.muted}>
            Source of truth for all financial data
          </Text>
        </VStack>
      </HStack>
      
      {/* Content */}
      {isMobile ? renderMobileLayout() : renderWebLayout()}
      
      {/* Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => dispatch({ type: 'transactions/closeModal' })} />
      
      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={currentFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        tags={allTags}
      />
      
      {/* Add Category Modal */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.5)"
        display={isCategoryModalOpen ? 'flex' : 'none'}
        alignItems="center"
        justifyContent="center"
        zIndex={1000}
      >
        <Box
          bg={colors.background.card}
          borderRadius="$xl"
          p="$6"
          w="90%"
          maxWidth={400}
        >
          <Text size="lg" fontWeight="$bold" color={colors.text.primary} mb="$4">
            Add New Category
          </Text>
          
          <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md" mb="$4">
            <InputField
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Category name"
              placeholderTextColor={colors.text.muted}
              onSubmitEditing={handleCategorySubmit}
            />
          </Input>
          
          <HStack gap="$3" justifyContent="flex-end">
            <Button
              variant="outline"
              onPress={() => dispatch({ type: 'transactions/closeCategoryModal' })}
              borderColor={colors.border.primary}
            >
              <Text color={colors.text.secondary}>Cancel</Text>
            </Button>
            <Button
              onPress={handleCategorySubmit}
              bg={colors.isDark ? '$primary500' : '$primary600'}
            >
              <Text color="white">Add</Text>
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

