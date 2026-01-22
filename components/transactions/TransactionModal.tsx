/**
 * Transaction Modal Component
 * Form for adding and editing financial transactions
 */

import { useThemedColors } from '@/constants/colors';
import {
  addExpenseCategory,
  addIncomeCategory,
  addTransaction,
  permanentDeleteTransaction,
  selectEditingTransactionId,
  selectExpenseCategories,
  selectIncomeCategories,
  selectModalMode,
  selectTransactionById,
  updateTransaction
} from '@/src/store/transactionSlice';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  PaymentMethod,
  TransactionFormData,
  TransactionType,
} from '@/src/types/transaction';
import { getTodayDate, validateAmount } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  FormControl,
  FormControlHelperText,
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
  Textarea,
  TextareaInput,
  VStack,
} from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function TransactionModal({ isOpen, onClose, defaultType = 'expense' }: TransactionModalProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  
  const modalMode = useSelector(selectModalMode);
  const editingTransactionId = useSelector(selectEditingTransactionId);
  const editingTransaction = useSelector(
    editingTransactionId ? selectTransactionById(editingTransactionId) : () => null
  );
  
  const incomeCategories = useSelector(selectIncomeCategories);
  const expenseCategories = useSelector(selectExpenseCategories);
  
  // Form state
  const [formData, setFormData] = useState<TransactionFormData>({
    date: getTodayDate(),
    amount: 0,
    type: defaultType,
    category: '',
    account: 'card',
    notes: '',
    tags: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  const [amountString, setAmountString] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Get current categories based on transaction type
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;
  const defaultCategories = formData.type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  
  // Load editing data
  useEffect(() => {
    if (modalMode === 'edit' && editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        account: editingTransaction.account,
        notes: editingTransaction.notes || '',
        tags: editingTransaction.tags || [],
      });
      setAmountString(String(Math.abs(editingTransaction.amount)));
    } else if (isOpen) {
      // Reset form for add mode
      setFormData({
        date: getTodayDate(),
        amount: 0,
        type: defaultType,
        category: '',
        account: 'card',
        notes: '',
        tags: [],
      });
      setAmountString('');
    }
    setErrors({});
    setTagInput('');
  }, [modalMode, editingTransaction, isOpen, defaultType]);
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};
    
    const amountValidation = validateAmount(parseFloat(amountString) || 0);
    if (!amountString.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error;
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const amount = parseFloat(amountString) || 0;
    const transactionData: TransactionFormData = {
      ...formData,
      amount,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      notes: formData.notes ? formData.notes : undefined,
    };
    
    if (modalMode === 'edit' && editingTransactionId) {
      dispatch(updateTransaction({ id: editingTransactionId, data: transactionData }));
    } else {
      dispatch(addTransaction(transactionData));
    }
    
    onClose();
  };
  
  // Handle type change
  const handleTypeChange = (type: TransactionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: '', // Reset category when type changes
    }));
  };
  
  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    let sanitized = cleaned;
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      sanitized = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    setAmountString(sanitized);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };
  
  // Handle add category
  const handleAddCategory = () => {
    const newCategory = tagInput.trim();
    if (!newCategory) return;
    
    if (formData.type === 'income') {
      dispatch(addIncomeCategory(newCategory));
    } else {
      dispatch(addExpenseCategory(newCategory));
    }
    
    setFormData((prev) => ({ ...prev, category: newCategory }));
    setTagInput('');
  };
  
  // Handle add tag
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag || formData.tags?.includes(newTag)) return;
    
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag],
    }));
    setTagInput('');
  };
  
  // Handle remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };
  
  // Handle delete
  const handleDelete = () => {
    if (editingTransactionId) {
      dispatch(permanentDeleteTransaction(editingTransactionId));
      onClose();
    }
  };
  
  const isIncome = formData.type === 'income';
  const isEditMode = modalMode === 'edit';
  const headerColor = isIncome ? (colors.isDark ? '#22c55e' : '#16a34a') : (colors.isDark ? '#ef4444' : '#dc2626');
  const headerBg = isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : (colors.isDark ? '#7f1d1d' : '#fef2f2');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader borderBottomWidth={1} borderColor={colors.border.primary} pb="$3" pt="$4">
          <HStack alignItems="center" gap="$3">
            <Box bg={headerBg} p="$2" borderRadius="$md">
              <MaterialCommunityIcons 
                name={isIncome ? 'trending-up' : 'trending-down'} 
                size={20} 
                color={headerColor} 
              />
            </Box>
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {!isEditMode ? (isIncome ? 'Add Income' : 'Add Expense') : 'Edit Transaction'}
            </Text>
          </HStack>
          <ModalCloseButton position="absolute" right="$3" top="$3">
            <MaterialCommunityIcons name="close" size={20} color={colors.text.muted} />
          </ModalCloseButton>
        </ModalHeader>
        
        <ModalBody py="$4">
          <VStack gap="$5">
            {/* Type Toggle */}
            <HStack gap="$3">
              <Pressable
                flex={1}
                onPress={() => handleTypeChange('expense')}
                py="$3"
                borderRadius="$md"
                borderWidth={2}
                borderColor={!isIncome ? '$error500' : colors.border.primary}
                bg={!isIncome ? (colors.isDark ? '#450a0a' : '#fef2f2') : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons 
                    name="trending-down" 
                    size={18} 
                    color={!isIncome ? '#ef4444' : colors.text.muted} 
                  />
                  <Text 
                    fontWeight="$semibold" 
                    color={!isIncome ? '#ef4444' : colors.text.muted}
                  >
                    Expense
                  </Text>
                </HStack>
              </Pressable>
              
              <Pressable
                flex={1}
                onPress={() => handleTypeChange('income')}
                py="$3"
                borderRadius="$md"
                borderWidth={2}
                borderColor={isIncome ? '$success500' : colors.border.primary}
                bg={isIncome ? (colors.isDark ? '#14532d' : '#f0fdf4') : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons 
                    name="trending-up" 
                    size={18} 
                    color={isIncome ? '#22c55e' : colors.text.muted} 
                  />
                  <Text 
                    fontWeight="$semibold" 
                    color={isIncome ? '#22c55e' : colors.text.muted}
                  >
                    Income
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
            
            {/* Amount */}
            <FormControl isInvalid={!!errors.amount}>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="currency-usd" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Amount *</Text>
                </HStack>
              </FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                <InputField
                  value={amountString}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.text.muted}
                  fontSize="$xl"
                  fontWeight="$bold"
                />
              </Input>
              {errors.amount && (
                <FormControlHelperText color="$error500">{errors.amount}</FormControlHelperText>
              )}
            </FormControl>
            
            {/* Date and Account */}
            <HStack gap="$4" flexWrap="wrap">
              <FormControl flex={1} minWidth={140} isInvalid={!!errors.date}>
                <FormControlLabel>
                  <HStack gap="$1" alignItems="center">
                    <MaterialCommunityIcons name="calendar" size={14} color={colors.text.muted} />
                    <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Date *</Text>
                  </HStack>
                </FormControlLabel>
                <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                  <InputField
                    value={formData.date}
                    onChangeText={(value) => {
                      setFormData((prev) => ({ ...prev, date: value }));
                      if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text.muted}
                  />
                </Input>
              </FormControl>
              
              <FormControl flex={1} minWidth={140}>
                <FormControlLabel>
                  <HStack gap="$1" alignItems="center">
                    <MaterialCommunityIcons name="credit-card-outline" size={14} color={colors.text.muted} />
                    <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Account</Text>
                  </HStack>
                </FormControlLabel>
                <Select
                  selectedValue={formData.account}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, account: value as PaymentMethod }))}
                >
                  <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                    <SelectInput />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectItem label="Cash" value="cash" />
                      <SelectItem label="Card" value="card" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
            </HStack>
            
            {/* Category */}
            <FormControl isInvalid={!!errors.category}>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="tag-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Category *</Text>
                </HStack>
              </FormControlLabel>
              
              <Select
                selectedValue={formData.category}
                onValueChange={(value: string) => {
                  setFormData((prev) => ({ ...prev, category: value }));
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
              >
                <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                  <SelectInput placeholder="Select category" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    {currentCategories.map((category) => (
                      <SelectItem key={category} label={category} value={category} />
                    ))}
                    <SelectItem label="+ Add new category" value="__add_new__" />
                  </SelectContent>
                </SelectPortal>
              </Select>
              
              {/* Add new category input */}
              {formData.category === '__add_new__' && (
                <HStack gap="$2" mt="$2">
                  <Input flex={1} bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                    <InputField
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="New category name"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                  <Button onPress={handleAddCategory} bg={colors.isDark ? '$primary500' : '$primary600'}>
                    <Text color="white">Add</Text>
                  </Button>
                </HStack>
              )}
              
              {errors.category && (
                <FormControlHelperText color="$error500">{errors.category}</FormControlHelperText>
              )}
            </FormControl>
            
            {/* Tags */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="tag-multiple-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Tags (Optional)</Text>
                </HStack>
              </FormControlLabel>
              
              {/* Tag chips */}
              {formData.tags && formData.tags.length > 0 && (
                <HStack gap="$2" flexWrap="wrap" mb="$2">
                  {formData.tags.map((tag) => (
                    <Box
                      key={tag}
                      bg={colors.background.secondary}
                      px="$2"
                      py="$1"
                      borderRadius="$md"
                      flexDirection="row"
                      alignItems="center"
                      gap="$1"
                    >
                      <Text size="sm" color={colors.text.secondary}>{tag}</Text>
                      <Pressable onPress={() => handleRemoveTag(tag)} hitSlop={8}>
                        <MaterialCommunityIcons name="close" size={14} color={colors.text.muted} />
                      </Pressable>
                    </Box>
                  ))}
                </HStack>
              )}
              
              {/* Add tag input */}
              <HStack gap="$2">
                <Input flex={1} bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md">
                  <InputField
                    value={tagInput}
                    onChangeText={setTagInput}
                    placeholder="Add a tag"
                    placeholderTextColor={colors.text.muted}
                    onSubmitEditing={handleAddTag}
                  />
                </Input>
                <Button 
                  onPress={handleAddTag} 
                  variant="outline"
                  borderColor={colors.border.primary}
                >
                  <Text color={colors.text.secondary}>Add Tag</Text>
                </Button>
              </HStack>
            </FormControl>
            
            {/* Notes */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="note-text-outline" size={14} color={colors.text.muted} />
                  <Text color={colors.text.secondary} size="sm" fontWeight="$medium">Notes (Optional)</Text>
                </HStack>
              </FormControlLabel>
              <Textarea
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <TextareaInput
                  value={formData.notes}
                  onChangeText={(value: string) => setFormData((prev) => ({ ...prev, notes: value }))}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.text.muted}
                  numberOfLines={3}
                />
              </Textarea>
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter borderTopWidth={1} borderColor={colors.border.primary} pt="$4" pb="$4">
          <HStack gap="$3" w="100%" justifyContent="space-between" alignItems="center">
            {isEditMode ? (
              <Button 
                variant="outline" 
                onPress={handleDelete}
                borderColor="$error500"
                borderRadius="$md"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons name="delete" size={16} color="#ef4444" />
                  <Text color="$error500" fontWeight="$medium">Delete</Text>
                </HStack>
              </Button>
            ) : (
              <Box />
            )}
            <HStack gap="$3">
              <Button variant="outline" onPress={onClose} borderColor={colors.border.primary} borderRadius="$md">
                <Text color={colors.text.secondary}>Cancel</Text>
              </Button>
              <Button 
                onPress={handleSubmit} 
                bg={isIncome ? (colors.isDark ? '$success500' : '$success600') : (colors.isDark ? '$error500' : '$error600')}
                borderRadius="$md"
                px="$6"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons name={!isEditMode ? 'plus' : 'check'} size={16} color="white" />
                  <Text color="white" fontWeight="$semibold">
                    {!isEditMode ? (isIncome ? 'Add Income' : 'Add Expense') : 'Save Changes'}
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

