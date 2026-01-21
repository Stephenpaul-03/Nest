/**
 * Report Helper Utilities
 * Aggregation and analysis functions for financial reports
 * Read-only calculations derived at render time
 */

import { Transaction } from '@/src/types/transaction';
import { DateRange, filterByType } from '@/src/utils/historyHelpers';
import { formatCurrency } from '@/src/utils/transactionHelpers';

// ============================================================================
// Types
// ============================================================================

export interface ReportMetrics {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  averagePerPeriod: number;
  incomeChange: number;
  incomeChangePercent: number;
  expenseChange: number;
  expenseChangePercent: number;
  netBalanceChange: number;
  netBalanceChangePercent: number;
}

export interface TopCategory {
  category: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface TopDay {
  date: string;
  total: number;
  transactionCount: number;
}

export interface CategoryAnalysis {
  category: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface DrillDownData {
  type: 'category' | 'day';
  title: string;
  subtitle: string;
  transactions: Transaction[];
}

// ============================================================================
// Core Metrics Calculations
// ============================================================================

/**
 * Calculate all report metrics for a given date range
 */
export function calculateReportMetrics(
  incomeTransactions: Transaction[],
  expenseTransactions: Transaction[],
  dateRange: DateRange,
  previousDateRange: DateRange
): ReportMetrics {
  // Filter transactions by date range
  const currentIncome = filterTransactionsByDateRange(incomeTransactions, dateRange);
  const currentExpense = filterTransactionsByDateRange(expenseTransactions, dateRange);
  const previousIncome = filterTransactionsByDateRange(incomeTransactions, previousDateRange);
  const previousExpense = filterTransactionsByDateRange(expenseTransactions, previousDateRange);

  // Calculate totals
  const totalIncome = calculateTotal(currentIncome);
  const totalExpense = calculateTotal(currentExpense);
  const previousIncomeTotal = calculateTotal(previousIncome);
  const previousExpenseTotal = calculateTotal(previousExpense);

  // Calculate net balance
  const netBalance = totalIncome - totalExpense;
  const previousNetBalance = previousIncomeTotal - previousExpenseTotal;

  // Calculate changes
  const incomeChange = totalIncome - previousIncomeTotal;
  const expenseChange = totalExpense - previousExpenseTotal;
  const netBalanceChange = netBalance - previousNetBalance;

  // Calculate percentage changes
  const incomeChangePercent = previousIncomeTotal > 0 
    ? (incomeChange / previousIncomeTotal) * 100 
    : 0;
  const expenseChangePercent = previousExpenseTotal > 0 
    ? (expenseChange / previousExpenseTotal) * 100 
    : 0;
  const netBalanceChangePercent = previousNetBalance !== 0 
    ? (netBalanceChange / Math.abs(previousNetBalance)) * 100 
    : 0;

  // Calculate average per period (using number of days)
  const daysInRange = getDaysInRange(dateRange);
  const totalTransactionCount = currentIncome.length + currentExpense.length;
  const averagePerPeriod = daysInRange > 0 
    ? (totalIncome + totalExpense) / daysInRange 
    : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    transactionCount: totalTransactionCount,
    averagePerPeriod,
    incomeChange,
    incomeChangePercent,
    expenseChange,
    expenseChangePercent,
    netBalanceChange,
    netBalanceChangePercent,
  };
}

// ============================================================================
// Top Categories & Days
// ============================================================================

/**
 * Get top 3 spending categories (expense only)
 */
export function getTopCategories(
  transactions: Transaction[],
  limit: number = 3
): TopCategory[] {
  // Filter to only expenses
  const expenses = filterByType(transactions, 'expense');
  
  // Group by category
  const categoryMap = new Map<string, Transaction[]>();
  for (const t of expenses) {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, []);
    }
    categoryMap.get(t.category)!.push(t);
  }

  // Calculate totals for each category
  const categories: TopCategory[] = [];
  const totalExpense = calculateTotal(expenses);

  for (const [category, categoryTransactions] of categoryMap) {
    const total = calculateTotal(categoryTransactions);
    const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;

    categories.push({
      category,
      total,
      percentage: Math.round(percentage * 100) / 100,
      transactionCount: categoryTransactions.length,
    });
  }

  // Sort by highest total and take top N
  return categories
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get top 3 days with highest spending (expense only)
 */
export function getTopDays(
  transactions: Transaction[],
  limit: number = 3
): TopDay[] {
  // Filter to only expenses
  const expenses = filterByType(transactions, 'expense');
  
  // Group by date
  const dayMap = new Map<string, Transaction[]>();
  for (const t of expenses) {
    if (!dayMap.has(t.date)) {
      dayMap.set(t.date, []);
    }
    dayMap.get(t.date)!.push(t);
  }

  // Calculate totals for each day
  const days: TopDay[] = [];
  for (const [date, dayTransactions] of dayMap) {
    const total = calculateTotal(dayTransactions);

    days.push({
      date,
      total,
      transactionCount: dayTransactions.length,
    });
  }

  // Sort by highest total and take top N
  return days
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ============================================================================
// Category Analysis
// ============================================================================

/**
 * Group expenses by category with full analysis
 */
export function groupExpensesByCategory(
  transactions: Transaction[]
): CategoryAnalysis[] {
  // Filter to only expenses
  const expenses = filterByType(transactions, 'expense');
  
  if (expenses.length === 0) {
    return [];
  }

  // Group by category
  const categoryMap = new Map<string, Transaction[]>();
  for (const t of expenses) {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, []);
    }
    categoryMap.get(t.category)!.push(t);
  }

  // Calculate totals for each category
  const totalExpense = calculateTotal(expenses);
  const categories: CategoryAnalysis[] = [];

  for (const [category, categoryTransactions] of categoryMap) {
    const total = calculateTotal(categoryTransactions);
    const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;

    categories.push({
      category,
      total,
      percentage: Math.round(percentage * 100) / 100,
      transactionCount: categoryTransactions.length,
    });
  }

  // Sort by highest total (descending)
  return categories.sort((a, b) => b.total - a.total);
}

// ============================================================================
// Drill-down Data
// ============================================================================

/**
 * Get transactions for a specific category drill-down
 */
export function getCategoryDrillDown(
  transactions: Transaction[],
  category: string
): DrillDownData {
  const categoryTransactions = transactions.filter(
    (t) => t.type === 'expense' && t.category === category && !t.deleted
  );

  // Sort chronologically
  categoryTransactions.sort((a, b) => 
    a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );

  const total = calculateTotal(categoryTransactions);

  return {
    type: 'category',
    title: category,
    subtitle: `${categoryTransactions.length} transactions • Total: $${formatCurrency(total)}`,
    transactions: categoryTransactions,
  };
}

/**
 * Get transactions for a specific day drill-down
 */
export function getDayDrillDown(
  transactions: Transaction[],
  date: string
): DrillDownData {
  const dayTransactions = transactions.filter(
    (t) => t.type === 'expense' && t.date === date && !t.deleted
  );

  // Sort chronologically
  dayTransactions.sort((a, b) => 
    a.createdAt.localeCompare(b.createdAt)
  );

  const total = calculateTotal(dayTransactions);

  return {
    type: 'day',
    title: formatDayLabel(date),
    subtitle: `${dayTransactions.length} transactions • Total: $${formatCurrency(total)}`,
    transactions: dayTransactions,
  };
}

// ============================================================================
// Period Comparison
// ============================================================================

/**
 * Get the previous period date range for comparison
 */
export function getPreviousPeriodRange(currentRange: DateRange): DateRange {
  const startDate = new Date(currentRange.start);
  const endDate = new Date(currentRange.end);
  
  const startDiffMs = endDate.getTime() - startDate.getTime();
  const startDiffDays = Math.ceil(startDiffMs / (1000 * 60 * 60 * 24));
  
  // Previous period has the same duration
  const previousEnd = new Date(startDate);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - startDiffDays);
  
  return {
    start: previousStart.toISOString().split('T')[0],
    end: previousEnd.toISOString().split('T')[0],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter transactions by date range
 */
function filterTransactionsByDateRange(
  transactions: Transaction[],
  dateRange: DateRange
): Transaction[] {
  return transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Calculate total amount for transactions
 */
function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get number of days in a date range
 */
function getDaysInRange(dateRange: DateRange): number {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Format day label for display
 */
function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get month options for picker
 */
export function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    months.push({ value, label });
  }
  
  return months;
}

/**
 * Get year options for picker
 */
export function getYearOptions(): { value: string; label: string }[] {
  const years: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i <= 5; i++) {
    const year = now.getFullYear() - i;
    years.push({ value: String(year), label: String(year) });
  }
  
  return years;
}

/**
 * Create date range for a specific month
 */
export function getMonthRange(year: number, month: number): DateRange {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Create date range for a specific year
 */
export function getYearRange(year: number): DateRange {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

// ============================================================================
// Trend Helpers
// ============================================================================

/**
 * Get trend indicator and description
 */
export function getTrendInfo(
  change: number,
  changePercent: number
): { indicator: 'increased' | 'decreased' | 'neutral'; text: string; color: string } {
  if (change > 0) {
    return {
      indicator: 'increased',
      text: `+${formatCurrency(change)} (+${Math.abs(changePercent).toFixed(1)}%)`,
      color: '#22c55e', // Green
    };
  } else if (change < 0) {
    return {
      indicator: 'decreased',
      text: `-${formatCurrency(Math.abs(change))} (-${Math.abs(changePercent).toFixed(1)}%)`,
      color: '#ef4444', // Red
    };
  }
  
  return {
    indicator: 'neutral',
    text: 'No change',
    color: '#6b7280', // Gray
  };
}

export { DateRange };

