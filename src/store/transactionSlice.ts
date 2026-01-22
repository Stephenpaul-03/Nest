/**
 * Transaction Redux Slice
 * State management for financial transactions
 */

import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  Transaction,
  TransactionFilters,
  TransactionFormData,
  TransactionState,
  TransactionType,
} from '@/src/types/transaction';
import {
  createTransaction,
  getLastTransaction,
} from '@/src/utils/transactionHelpers';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Storage key for persistence
export const transactionStorageKey = 'transactions';

// Initial state
const initialFilters: TransactionFilters = {
  category: 'all',
  account: 'all',
  search: '',
  date: undefined,
  tags: undefined,
};

// Initialize with empty transactions - no mock data
const initialState: TransactionState = {
  transactions: [],
  incomeCategories: [...DEFAULT_INCOME_CATEGORIES],
  expenseCategories: [...DEFAULT_EXPENSE_CATEGORIES],
  filters: initialFilters,
  modalMode: 'add',
  editingTransactionId: null,
  isModalOpen: false,
  isCategoryModalOpen: false,
  categoryModalType: null,
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state, action: PayloadAction<TransactionType>) => {
      state.modalMode = 'add';
      state.editingTransactionId = null;
      state.isModalOpen = true;
      // Store the type for default category selection
      // This will be used when opening the modal
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.modalMode = 'edit';
      state.editingTransactionId = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingTransactionId = null;
    },

    // Category modal actions
    openCategoryModal: (state, action: PayloadAction<TransactionType>) => {
      state.categoryModalType = action.payload;
      state.isCategoryModalOpen = true;
    },
    closeCategoryModal: (state) => {
      state.isCategoryModalOpen = false;
      state.categoryModalType = null;
    },

    // CRUD operations
    addTransaction: (state, action: PayloadAction<TransactionFormData>) => {
      const newTransaction = createTransaction({
        ...action.payload,
        createdBy: 'Current User', // In production, this would come from auth state
        deleted: false,
      });
      state.transactions.push(newTransaction);
    },

    updateTransaction: (
      state,
      action: PayloadAction<{ id: string; data: Partial<TransactionFormData> }>
    ) => {
      const { id, data } = action.payload;
      const index = state.transactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        const existingTransaction = state.transactions[index];
        state.transactions[index] = {
          ...existingTransaction,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    // Soft delete
    softDeleteTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find((t) => t.id === action.payload);
      if (transaction) {
        transaction.deleted = true;
        transaction.updatedAt = new Date().toISOString();
      }
    },

    // Restore soft-deleted transaction
    restoreTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find((t) => t.id === action.payload);
      if (transaction) {
        transaction.deleted = false;
        transaction.updatedAt = new Date().toISOString();
      }
    },

    // Permanent delete (use with caution)
    permanentDeleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },

    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },

    // Category management
    addIncomeCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload.trim();
      if (category && !state.incomeCategories.includes(category)) {
        state.incomeCategories.push(category);
      }
    },
    addExpenseCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload.trim();
      if (category && !state.expenseCategories.includes(category)) {
        state.expenseCategories.push(category);
      }
    },

    // Quick tools actions
    duplicateLastTransaction: (state, action: PayloadAction<TransactionType>) => {
      const lastTransaction = getLastTransaction(
        state.transactions,
        action.payload
      );
      if (lastTransaction) {
        const newTransaction = createTransaction({
          date: new Date().toISOString().split('T')[0],
          amount: lastTransaction.amount,
          type: lastTransaction.type,
          category: lastTransaction.category,
          account: lastTransaction.account,
          notes: `Duplicate of ${lastTransaction.date}`,
          tags: lastTransaction.tags,
          createdBy: 'Current User',
          deleted: false,
        });
        state.transactions.push(newTransaction);
      }
    },

    repeatLastTransaction: (state, action: PayloadAction<TransactionType>) => {
      const lastTransaction = getLastTransaction(
        state.transactions,
        action.payload
      );
      if (lastTransaction) {
        const newTransaction = createTransaction({
          date: new Date().toISOString().split('T')[0],
          amount: lastTransaction.amount,
          type: lastTransaction.type,
          category: lastTransaction.category,
          account: lastTransaction.account,
          notes: `Repeat of ${lastTransaction.date}`,
          tags: lastTransaction.tags,
          createdBy: 'Current User',
          deleted: false,
        });
        state.transactions.push(newTransaction);
      }
    },

    // Bulk operations
    loadTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },

    clearAllTransactions: (state) => {
      state.transactions = [];
    },

    // Import transactions from JSON/Excel format
    importTransactions: (state, action: PayloadAction<Partial<Transaction>[]>) => {
      const importedTransactions = action.payload.filter(t => 
        t.date && 
        t.amount !== undefined && 
        t.type && 
        t.category && 
        t.account
      );

      const now = new Date().toISOString();
      const newTransactions: Transaction[] = importedTransactions.map(t => ({
        id: t.id || `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: t.date!,
        amount: t.amount!,
        type: t.type!,
        category: t.category!,
        account: t.account!,
        notes: t.notes,
        tags: t.tags,
        createdBy: t.createdBy || 'Imported',
        createdAt: t.createdAt || now,
        updatedAt: now,
        deleted: t.deleted || false,
      }));

      state.transactions = [...state.transactions, ...newTransactions];
    },

    // Set transaction type for new transaction (used by quick tools)
    setNewTransactionType: (state, action: PayloadAction<TransactionType>) => {
      // This is stored temporarily for the modal to know what type to add
      // In a real app, this might be handled differently
    },
  },
});

// Export actions
export const {
  openAddModal,
  openEditModal,
  closeModal,
  openCategoryModal,
  closeCategoryModal,
  addTransaction,
  updateTransaction,
  softDeleteTransaction,
  restoreTransaction,
  permanentDeleteTransaction,
  setFilters,
  resetFilters,
  addIncomeCategory,
  addExpenseCategory,
  duplicateLastTransaction,
  repeatLastTransaction,
  loadTransactions,
  clearAllTransactions,
  importTransactions,
  setNewTransactionType,
} = transactionSlice.actions;

export default transactionSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

export const selectTransactions = (state: { transactions: TransactionState }) =>
  state.transactions.transactions;

export const selectNonDeletedTransactions = (state: {
  transactions: TransactionState;
}) => state.transactions.transactions.filter((t) => !t.deleted);

export const selectIncomeTransactions = (state: {
  transactions: TransactionState;
}) => state.transactions.transactions.filter(
  (t) => t.type === 'income' && !t.deleted
);

export const selectExpenseTransactions = (state: {
  transactions: TransactionState;
}) => state.transactions.transactions.filter(
  (t) => t.type === 'expense' && !t.deleted
);

export const selectFilters = (state: { transactions: TransactionState }) =>
  state.transactions.filters;

export const selectIsModalOpen = (state: { transactions: TransactionState }) =>
  state.transactions.isModalOpen;

export const selectModalMode = (state: { transactions: TransactionState }) =>
  state.transactions.modalMode;

export const selectEditingTransactionId = (state: {
  transactions: TransactionState;
}) => state.transactions.editingTransactionId;

export const selectTransactionById =
  (id: string) => (state: { transactions: TransactionState }) =>
    state.transactions.transactions.find((t) => t.id === id);

export const selectIncomeCategories = (state: {
  transactions: TransactionState;
}) => state.transactions.incomeCategories;

export const selectExpenseCategories = (state: {
  transactions: TransactionState;
}) => state.transactions.expenseCategories;

export const selectIsCategoryModalOpen = (state: {
  transactions: TransactionState;
}) => state.transactions.isCategoryModalOpen;

export const selectCategoryModalType = (state: {
  transactions: TransactionState;
}) => state.transactions.categoryModalType;

export const selectLastTransaction =
  (type?: TransactionType) => (state: { transactions: TransactionState }) =>
    getLastTransaction(state.transactions.transactions, type);

