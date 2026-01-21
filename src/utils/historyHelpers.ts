/**
 * History Helper Utilities
 * Grouping, aggregation, and calculation functions for transaction history
 */

import {
  PaymentMethod,
  Transaction,
  TransactionFilters,
  TransactionType
} from '@/src/types/transaction';
import { matchesFilters } from '@/src/utils/transactionHelpers';

// ============================================================================
// Grouping Types
// ============================================================================

export type GroupingType = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface TransactionGroup {
  id: string;              // Unique identifier for the group
  label: string;           // Display label (e.g., "January 2025", "Week 3")
  dateRange: DateRange;    // Date range for this group
  transactions: Transaction[];
  total: number;           // Sum of amounts in this group
  itemCount: number;       // Number of transactions
}

// ============================================================================
// Grouping Logic
// ============================================================================

/**
 * Get the grouping key for a transaction based on grouping type
 */
export function getGroupKey(date: string, grouping: GroupingType): string {
  const d = new Date(date);
  
  switch (grouping) {
    case 'day':
      return date; // YYYY-MM-DD
    case 'week':
      return getWeekKey(d);
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    case 'year':
      return String(d.getFullYear());
    case 'custom':
      return date; // For custom, we'll handle differently
    default:
      return date;
  }
}

/**
 * Get week key in format "YYYY-Www"
 */
function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get human-readable label for a group key
 */
export function getGroupLabel(key: string, grouping: GroupingType): string {
  switch (grouping) {
    case 'day':
      return formatDateLabel(key);
    case 'week':
      return `Week of ${formatDateLabel(getWeekStartDate(key))}`;
    case 'month':
      return formatMonthLabel(key);
    case 'year':
      return key;
    case 'custom':
      return key;
    default:
      return key;
  }
}

/**
 * Get the start date of a week from the week key
 */
function getWeekStartDate(weekKey: string): string {
  const [year, week] = weekKey.split('-W');
  const yearNum = parseInt(year, 10);
  const weekNum = parseInt(week, 10);
  
  const simple = new Date(yearNum, 0, 1 + (weekNum - 1) * 7);
  const dow = simple.getDay();
  const weekStart = simple;
  
  if (dow <= 4) {
    weekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    weekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  
  return weekStart.toISOString().split('T')[0];
}

/**
 * Format date as human-readable label
 */
export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format month key as human-readable label
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Format year as human-readable label
 */
export function formatYearLabel(year: string): string {
  return year;
}

// ============================================================================
// Filtering & Processing
// ============================================================================

/**
 * Filter transactions by type (income/expense)
 */
export function filterByType(
  transactions: Transaction[],
  type: TransactionType,
  includeDeleted: boolean = false
): Transaction[] {
  return transactions.filter((t) => {
    const matchesType = t.type === type;
    const matchesDeleted = includeDeleted || !t.deleted;
    return matchesType && matchesDeleted;
  });
}

/**
 * Apply filters to transactions
 */
export function applyFilters(
  transactions: Transaction[],
  filters: HistoryFilters
): Transaction[] {
  let filtered = [...transactions];
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type);
  }
  
  // Filter by includeDeleted
  if (!filters.includeDeleted) {
    filtered = filtered.filter((t) => !t.deleted);
  }
  
// Apply transaction filters
  const transactionFilters: TransactionFilters = {
    category: filters.category === 'all' ? undefined : filters.category,
    account: filters.account === 'all' ? undefined : (filters.account as PaymentMethod),
    tags: filters.tags,
    search: filters.search,
    date: filters.dateRange,
  };
  
  filtered = filtered.filter((t) => matchesFilters(t, transactionFilters));
  
  return filtered;
}

/**
 * Sort transactions by date (oldest first)
 */
export function sortByDateAscending(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/**
 * Sort transactions by date (newest first)
 */
export function sortByDateDescending(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

// ============================================================================
// Grouping Functions
// ============================================================================

/**
 * Group transactions by the specified grouping type
 */
export function groupTransactions(
  transactions: Transaction[],
  grouping: GroupingType
): TransactionGroup[] {
  const sorted = sortByDateAscending(transactions);
  const groups: Record<string, TransactionGroup> = {};
  
  for (const transaction of sorted) {
    const key = getGroupKey(transaction.date, grouping);
    
    if (!groups[key]) {
      const groupTransactions = sorted.filter((t) => getGroupKey(t.date, grouping) === key);
      
      groups[key] = {
        id: key,
        label: getGroupLabel(key, grouping),
        dateRange: getDateRangeForGroup(groupTransactions, grouping),
        transactions: groupTransactions,
        total: groupTransactions.reduce((sum, t) => sum + t.amount, 0),
        itemCount: groupTransactions.length,
      };
    }
  }
  
  // Convert to array and ensure chronological order
  return Object.values(groups).sort((a, b) => {
    return a.dateRange.start.localeCompare(b.dateRange.start);
  });
}

/**
 * Get the date range for a group
 */
function getDateRangeForGroup(
  transactions: Transaction[],
  grouping: GroupingType
): DateRange {
  if (transactions.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return { start: today, end: today };
  }
  
  const sorted = sortByDateAscending(transactions);
  return {
    start: sorted[0].date,
    end: sorted[sorted.length - 1].date,
  };
}

// ============================================================================
// Running Balance
// ============================================================================

/**
 * Calculate running balance for groups
 */
export function calculateRunningBalances(
  groups: TransactionGroup[]
): { groupId: string; runningBalance: number }[] {
  let balance = 0;
  return groups.map((group) => {
    balance += group.total;
    return {
      groupId: group.id,
      runningBalance: balance,
    };
  });
}

/**
 * Calculate running balance for individual transactions
 */
export function calculateTransactionRunningBalances(
  groups: TransactionGroup[]
): Map<string, number> {
  const balances = new Map<string, number>();
  let balance = 0;
  
  for (const group of groups) {
    for (const transaction of group.transactions) {
      balance += transaction.amount;
      balances.set(transaction.id, balance);
    }
  }
  
  return balances;
}

// ============================================================================
// Aggregation
// ============================================================================

/**
 * Calculate total amount for a collection of transactions
 */
export function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate average transaction amount
 */
export function calculateAverage(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  return calculateTotal(transactions) / transactions.length;
}

/**
 * Get transaction count
 */
export function getTransactionCount(transactions: Transaction[]): number {
  return transactions.length;
}

/**
 * Get unique categories from filtered transactions
 */
export function getFilteredCategories(
  transactions: Transaction[],
  type: TransactionType
): string[] {
  const filtered = filterByType(transactions, type);
  const categories = new Set(filtered.map((t) => t.category));
  return Array.from(categories).sort();
}

/**
 * Get unique tags from filtered transactions
 */
export function getFilteredTags(transactions: Transaction[]): string[] {
  const tags = new Set<string>();
  for (const t of transactions) {
    if (t.tags) {
      t.tags.forEach((tag) => tags.add(tag));
    }
  }
  return Array.from(tags).sort();
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get current month's date range
 */
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];
  return { start, end };
}

/**
 * Get current year's date range
 */
export function getCurrentYearRange(): DateRange {
  const now = new Date();
  const start = `${now.getFullYear()}-01-01`;
  const end = `${now.getFullYear()}-12-31`;
  return { start, end };
}

/**
 * Get last N days date range
 */
export function getLastDaysRange(days: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: string, range: DateRange): boolean {
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

// ============================================================================
// History Filters Type
// ============================================================================

export interface HistoryFilters {
  type: TransactionType;
  grouping: GroupingType;
  dateRange?: DateRange;
  category?: string | 'all';
  account?: string | 'all';
  tags?: string[];
  search?: string;
  includeDeleted: boolean;
}

// ============================================================================
// Default Filters
// ============================================================================

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  type: 'expense',
  grouping: 'month',
  dateRange: getCurrentMonthRange(),
  category: 'all',
  account: 'all',
  tags: undefined,
  search: undefined,
  includeDeleted: false,
};

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate date range
 */
export function isValidDateRange(range: DateRange): boolean {
  if (!range.start || !range.end) return false;
  return range.start <= range.end;
}

