/**
 * Reports Page
 * Read-only financial analysis and summary view
 * 
 * Features:
 * - Income/Expense separation (never mixed)
 * - Top-level metrics with trend indicators
 * - Top 3 spending categories and days
 * - Category-wise expense breakdown
 * - Drill-down to transaction details
 * - Time range selection (current month, year, custom)
 */

import { CategoryAnalysisCard } from '@/components/reports/CategoryAnalysisCard';
import { QuickToolsSection, TimeRangePicker } from '@/components/reports/QuickToolsSection';
import { ReportsDrillDownModal } from '@/components/reports/ReportsDrillDownModal';
import { NetBalanceCard, ReportsMetricsCard } from '@/components/reports/ReportsMetricsCard';
import { TopThreeCard } from '@/components/reports/TopThreeCard';
import { useSidebarState } from '@/components/sidebar/hooks/useSidebarState';
import { useThemedColors } from '@/constants/colors';
import {
  selectExpenseTransactions,
  selectIncomeTransactions,
} from '@/src/store/transactionSlice';
import { Transaction } from '@/src/types/transaction';
import {
  calculateReportMetrics,
  DateRange,
  DrillDownData,
  getMonthRange,
  getPreviousPeriodRange,
  getTopCategories,
  getTopDays,
  groupExpensesByCategory
} from '@/src/utils/reportHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type TimeRangeType = 'month' | 'year' | 'custom';

interface TimeRangeState {
  type: TimeRangeType;
  value: string; // 'YYYY-MM' for month, 'YYYY' for year, 'YYYY-MM-DD to YYYY-MM-DD' for custom
}

export default function Report() {
  const colors = useThemedColors();
  const sidebarState = useSidebarState();
  
  // Responsive layout
  const isMobile = sidebarState.isMobile;
  
  // Redux state (read-only)
  const incomeTransactions = useSelector(selectIncomeTransactions) as Transaction[];
  const expenseTransactions = useSelector(selectExpenseTransactions) as Transaction[];
  
  // Time range state
  const now = new Date();
  const [timeRange, setTimeRange] = useState<TimeRangeState>({
    type: 'month',
    value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Drill-down state
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  
  // Get current date range based on selection
  const currentDateRange = useMemo((): DateRange => {
    if (timeRange.type === 'month') {
      const [year, month] = timeRange.value.split('-').map(Number);
      return getMonthRange(year, month);
    } else if (timeRange.type === 'year') {
      const year = parseInt(timeRange.value, 10);
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      };
    }
    const now = new Date();
    return getMonthRange(now.getFullYear(), now.getMonth() + 1);
  }, [timeRange]);
  
  // Get previous period range for comparison
  const previousDateRange = useMemo(() => {
    return getPreviousPeriodRange(currentDateRange);
  }, [currentDateRange]);
  
  // Get time range label
  const timeRangeLabel = useMemo(() => {
    if (timeRange.type === 'month') {
      const [year, month] = timeRange.value.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else if (timeRange.type === 'year') {
      return `Year ${timeRange.value}`;
    }
    return 'Custom Range';
  }, [timeRange]);
  
  // Filter transactions by date range
  const filteredIncomeTransactions = useMemo(() => {
    const start = new Date(currentDateRange.start);
    const end = new Date(currentDateRange.end);
    return incomeTransactions.filter((t: { date: string | number | Date; }) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }, [incomeTransactions, currentDateRange]);
  
  const filteredExpenseTransactions = useMemo(() => {
    const start = new Date(currentDateRange.start);
    const end = new Date(currentDateRange.end);
    return expenseTransactions.filter((t: { date: string | number | Date; }) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }, [expenseTransactions, currentDateRange]);
  
  // Combine filtered transactions for analysis
  const allFilteredTransactions = useMemo(() => {
    return [...filteredIncomeTransactions, ...filteredExpenseTransactions];
  }, [filteredIncomeTransactions, filteredExpenseTransactions]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateReportMetrics(
      filteredIncomeTransactions,
      filteredExpenseTransactions,
      currentDateRange,
      previousDateRange
    );
  }, [filteredIncomeTransactions, filteredExpenseTransactions, currentDateRange, previousDateRange]);
  
  // Get top categories (expense only)
  const topCategories = useMemo(() => {
    return getTopCategories(filteredExpenseTransactions, 3);
  }, [filteredExpenseTransactions]);
  
  // Get top days (expense only)
  const topDays = useMemo(() => {
    return getTopDays(filteredExpenseTransactions, 3);
  }, [filteredExpenseTransactions]);
  
  // Get category analysis (expense only)
  const categoryAnalysis = useMemo(() => {
    return groupExpensesByCategory(filteredExpenseTransactions);
  }, [filteredExpenseTransactions]);
  
  // Get trend info for metrics
  const incomeTrend = useMemo(() => {
    return {
      text: metrics.incomeChange >= 0 
        ? `+$${metrics.incomeChange.toFixed(2)} (+${Math.abs(metrics.incomeChangePercent).toFixed(1)}%)`
        : `-$${Math.abs(metrics.incomeChange).toFixed(2)} (-${Math.abs(metrics.incomeChangePercent).toFixed(1)}%)`,
      color: metrics.incomeChange >= 0 ? '#22c55e' : '#ef4444',
      indicator: metrics.incomeChange >= 0 ? 'increased' as const : 'decreased' as const,
    };
  }, [metrics.incomeChange, metrics.incomeChangePercent]);
  
  const expenseTrend = useMemo(() => {
    return {
      text: metrics.expenseChange >= 0 
        ? `+$${metrics.expenseChange.toFixed(2)} (+${Math.abs(metrics.expenseChangePercent).toFixed(1)}%)`
        : `-$${Math.abs(metrics.expenseChange).toFixed(2)} (-${Math.abs(metrics.expenseChangePercent).toFixed(1)}%)`,
      color: metrics.expenseChange >= 0 ? '#ef4444' : '#22c55e',
      indicator: metrics.expenseChange >= 0 ? 'increased' as const : 'decreased' as const,
    };
  }, [metrics.expenseChange, metrics.expenseChangePercent]);
  
  const netBalanceTrend = useMemo(() => {
    const isPositive = metrics.netBalanceChange >= 0;
    return {
      text: metrics.netBalanceChange >= 0 
        ? `+$${metrics.netBalanceChange.toFixed(2)}`
        : `-$${Math.abs(metrics.netBalanceChange).toFixed(2)}`,
      color: isPositive ? '#22c55e' : '#ef4444',
      indicator: isPositive ? 'increased' as const : 'decreased' as const,
    };
  }, [metrics.netBalanceChange]);
  
  // Handle drill-down
  const handleCategoryPress = (category: string) => {
    const data = {
      type: 'category' as const,
      title: category,
      subtitle: '',
      transactions: filteredExpenseTransactions.filter(
        (t: { category: string; deleted: any; }) => t.category === category && !t.deleted
      ),
    };
    
    const total = data.transactions.reduce((sum: any, t: { amount: any; }) => sum + t.amount, 0);
    data.subtitle = `${data.transactions.length} transaction${data.transactions.length !== 1 ? 's' : ''} • Total: $${total.toFixed(2)}`;
    
    // Sort chronologically
    data.transactions.sort((a: { date: string; createdAt: string; }, b: { date: any; createdAt: any; }) => 
      a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
    );
    
    setDrillDownData(data);
  };
  
  const handleDayPress = (date: string) => {
    const data = {
      type: 'day' as const,
      title: new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      subtitle: '',
      transactions: filteredExpenseTransactions.filter(
        (t: { date: string; deleted: any; }) => t.date === date && !t.deleted
      ),
    };
    
    const total = data.transactions.reduce((sum: any, t: { amount: any; }) => sum + t.amount, 0);
    data.subtitle = `${data.transactions.length} transaction${data.transactions.length !== 1 ? 's' : ''} • Total: $${total.toFixed(2)}`;
    
    // Sort chronologically
    data.transactions.sort((a: { createdAt: string; }, b: { createdAt: any; }) => a.createdAt.localeCompare(b.createdAt));
    
    setDrillDownData(data);
  };
  
  // Handle time range selection
  const handleTimeRangeSelect = (range: TimeRangeState) => {
    setTimeRange(range);
  };
  
  // Render header
  const renderHeader = () => (
    <VStack gap="$4" mb="$4">
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack>
          <Heading size="xl" color={colors.text.primary}>
            Reports
          </Heading>
          <Text size="sm" color={colors.text.muted}>
            Financial summary and analysis
          </Text>
        </VStack>
        
        {/* Time Range Selector */}
        <Pressable
          onPress={() => setShowTimePicker(true)}
          hitSlop={8}
        >
          <HStack
            bg={colors.background.secondary}
            borderRadius="$md"
            px="$3"
            py="$2"
            alignItems="center"
            gap="$2"
            borderWidth={1}
            borderColor={colors.border.primary}
          >
            <MaterialCommunityIcons
              name="calendar-range"
              size={18}
              color={colors.text.secondary}
            />
            <Text size="sm" color={colors.text.secondary}>
              {timeRangeLabel}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={16}
              color={colors.text.muted}
            />
          </HStack>
        </Pressable>
      </HStack>
    </VStack>
  );
  
  // Render empty state
  const renderEmptyState = () => {
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
          name="chart-bar"
          size={64}
          color={colors.text.muted}
        />
        <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} mt="$4" textAlign="center">
          No data for this period
        </Text>
        <Text size="sm" color={colors.text.muted} mt="$1" textAlign="center" mb="$4">
          Add transactions or change the date range to see your financial reports
        </Text>
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
              Add Transactions
            </Text>
          </Box>
        </Pressable>
      </Box>
    );
  };
  
  // Check if there's any data
  const hasData = filteredIncomeTransactions.length > 0 || filteredExpenseTransactions.length > 0;
  
  return (
    <Box flex={1} bg={colors.background.primary} p={isMobile ? '$4' : '$6'}>
      {renderHeader()}
      
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <VStack gap="$4">
          {/* Top-Level Metrics Section */}
          {hasData ? (
            <VStack gap="$4">
              {/* Income and Expense Cards */}
              <HStack gap="$4" flexWrap="wrap">
                <ReportsMetricsCard
                  title="Total Income"
                  value={metrics.totalIncome}
                  change={incomeTrend}
                  subtitle={`${filteredIncomeTransactions.length} transaction${filteredIncomeTransactions.length !== 1 ? 's' : ''}`}
                  isPositive={true}
                />
                <ReportsMetricsCard
                  title="Total Expense"
                  value={metrics.totalExpense}
                  change={expenseTrend}
                  subtitle={`${filteredExpenseTransactions.length} transaction${filteredExpenseTransactions.length !== 1 ? 's' : ''}`}
                  isPositive={false}
                />
              </HStack>
              
              {/* Net Balance Card */}
              <NetBalanceCard
                income={metrics.totalIncome}
                expense={metrics.totalExpense}
                change={netBalanceTrend}
              />
              
              {/* Average Per Period */}
              <HStack gap="$4" flexWrap="wrap">
                <ReportsMetricsCard
                  title="Daily Average"
                  value={metrics.averagePerPeriod}
                  subtitle={`Based on ${metrics.transactionCount} total transactions`}
                />
                <ReportsMetricsCard
                  title="Transaction Count"
                  value={metrics.transactionCount}
                  subtitle="Total transactions in period"
                />
              </HStack>
            </VStack>
          ) : (
            renderEmptyState()
          )}
          
          {/* Analysis Section */}
          {hasData && (
            <VStack gap="$4">
              {/* Section Title */}
              <HStack alignItems="center" gap="$2">
                <MaterialCommunityIcons
                  name="chart-pie"
                  size={18}
                  color={colors.text.muted}
                />
                <Text size="md" fontWeight="$bold" color={colors.text.primary}>
                  Analysis
                </Text>
              </HStack>
              
              {/* Two Column Layout */}
              <HStack gap="$4" flexDirection={isMobile ? 'column' : 'row'} alignItems="stretch">
                {/* Left Column - Top 3s */}
                <Box flex={isMobile ? undefined : 1} minHeight={isMobile ? undefined : 400}>
                  <TopThreeCard
                    topCategories={topCategories}
                    topDays={topDays}
                    onCategoryPress={handleCategoryPress}
                    onDayPress={handleDayPress}
                  />
                </Box>
                
                {/* Right Column - Category Analysis */}
                <Box flex={isMobile ? undefined : 1} minHeight={isMobile ? undefined : 400}>
                  <CategoryAnalysisCard
                    categories={categoryAnalysis}
                    totalExpense={metrics.totalExpense}
                    onCategoryPress={handleCategoryPress}
                  />
                </Box>
              </HStack>
            </VStack>
          )}
          
          {/* Quick Tools Section */}
          {hasData && (
            <QuickToolsSection
              onChangeTimeRange={() => setShowTimePicker(true)}
            />
          )}
        </VStack>
      </ScrollView>
      
      {/* Time Range Picker Modal */}
      <TimeRangePicker
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        currentRange={timeRange}
        onSelect={handleTimeRangeSelect}
      />
      
      {/* Drill-Down Modal */}
      <ReportsDrillDownModal
        isOpen={!!drillDownData}
        onClose={() => setDrillDownData(null)}
        data={drillDownData}
      />
    </Box>
  );
}

